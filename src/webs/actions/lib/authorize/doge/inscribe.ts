/**
 * DOGE MetaID Inscription
 *
 * 实现 Dogecoin 上的 MetaID Pin 铭刻功能
 * 使用 P2SH (Pay-to-Script-Hash) 将铭刻数据存储在 ScriptSig 中
 *
 * 交易结构 (2笔交易):
 * 1. Commit TX: 创建 P2SH 输出
 * 2. Reveal TX: 花费 P2SH 输出，ScriptSig 包含铭刻数据
 *
 * ScriptSig 结构:
 * <metaid> <operation> <contentType> <encryption> <version> <path> <body> <signature> <redeem_script>
 *
 * Redeem Script 结构:
 * <pubkey> OP_CHECKSIGVERIFY OP_DROP OP_DROP ... OP_TRUE
 */

import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import bs58check from 'bs58check';
// import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 as nobleSha256 } from '@noble/hashes/sha2';
import { hmac } from '@noble/hashes/hmac';
import { broadcastDogeTx, fetchDogeUtxos } from '../../../../../queries/doge';
import { getDogeWallet } from '@/chat/wallet/doge/wallet';
import { sleep } from '@/lib/helpers';
import * as secp256k1 from '@noble/secp256k1';
import { Platform } from 'react-native';
import { script, opcodes } from 'bitcoinjs-lib';

// 初始化内部 hashes
secp256k1.hashes.sha256 = nobleSha256;
secp256k1.hashes.sha256Async = async (msg: Uint8Array) => nobleSha256(msg);
secp256k1.hashes.hmacSha256 = (key: Uint8Array, msg: Uint8Array) => hmac(nobleSha256, key, msg);
secp256k1.hashes.hmacSha256Async = async (key: Uint8Array, msg: Uint8Array) =>
  hmac(nobleSha256, key, msg);

function randomBytesRN(size: number): Buffer {
  const buf = new Uint8Array(size);
  (globalThis.crypto as any).getRandomValues(buf);
  return Buffer.from(buf);
}

// 延迟初始化，避免在模块加载时就导入 @bitcoinerlab/secp256k1
// 这样可以避免与 bitcore-lib 的 crypto 模块冲突
let ECPair: any | null = null;
let eccInitialized = false;

async function ensureEccInitialized() {
  if (!eccInitialized) {
    let backendImpl: any = null;

    const useNoble = async () => {
      const impl = {
        // 判断是否是有效公钥点
        isPoint: (p: Uint8Array) => {
          try {
            return !!secp256k1.Point.fromHex(Buffer.from(p).toString('hex'));
          } catch {
            return false;
          }
        },

        // 压缩/解压公钥点
        pointCompress: (p: Uint8Array, compressed = true) => {
          const point = secp256k1.Point.fromHex(Buffer.from(p).toString('hex'));
          return Buffer.from(point.toBytes(compressed));
        },

        // 通过私钥生成公钥
        pointFromScalar: (d: Uint8Array, compressed = true) => {
          return Buffer.from(secp256k1.getPublicKey(d, compressed));
        },

        // 点加法
        pointAdd: (a: Uint8Array, b: Uint8Array, compressed = true) => {
          const pa = secp256k1.Point.fromHex(Buffer.from(a).toString('hex'));
          const pb = secp256k1.Point.fromHex(Buffer.from(b).toString('hex'));
          return Buffer.from(pa.add(pb).toBytes(compressed));
        },

        // 点乘法
        pointMultiply: (p: Uint8Array, d: Uint8Array, compressed = true) => {
          const point = secp256k1.Point.fromHex(Buffer.from(p).toString('hex'));
          const priv = BigInt('0x' + Buffer.from(d).toString('hex'));
          return Buffer.from(point.multiply(priv).toBytes(compressed));
        },

        // 验证私钥合法性
        isPrivate: (d: Uint8Array) => secp256k1.utils.isValidSecretKey(d),

        // 异步签名 R||S — use signAsync so we rely on WebCrypto and avoid noble.hashes sync dependency
        sign: async (msg: Uint8Array, priv: Uint8Array) => {
          // const msgHash = nobleSha256(msg);
          // const sig = await secp256k1.sign(msgHash, priv, { prehash: true }); // 64字节 R||S
          //88888
          // const sigDER = await secp256k1.sign(msg, priv); // 64字节 R||S
          // return Buffer.from(sig.slice(0, 64));
          // return Buffer.concat([
          //   Buffer.from(sigDER),
          //   Buffer.from([bitcoin.Transaction.SIGHASH_ALL]),
          // ]);

          const sig64 = await secp256k1.sign(msg, priv, { lowS: true, format: 'compact',prehash: false }); // 64字节 R||S
          return Buffer.from(sig64);
        },

        // 验证签名（使用异步接口以避免依赖 noble.hashes 的同步实现）
        verify: (msg: Uint8Array, sig: Uint8Array, pub: Uint8Array) => {
          // const msgHash = nobleSha256(msg);
          // return await secp256k1.verify(sig, msgHash, pub, { prehash: true });
          return secp256k1.verify(sig, msg, pub);
        },
      };

      return { name: 'noble', impl };
    };
    if (Platform.OS === 'ios') {
      // force noble on iOS to avoid any native binary / JSI HostFunction crashes
      try {
        // (bitcoin as any).crypto = {
        //   ...bitcoin.crypto,
        //   sha256: (data: Buffer | Uint8Array) => Buffer.from(hash.sha256().update(data).digest()),
        // sha256: (data: Buffer | Uint8Array) => Buffer.from(sha256(data)),
        // ripemd160: (data: Buffer | Uint8Array) => Buffer.from(ripemd160(data)),
        // };
        const nb = await useNoble();
        // lightweight smoke-test: derive a public key from a deterministic sample
        const samplePriv = new Uint8Array(32).fill(1);
        const pub = nb.impl.pointFromScalar(samplePriv, true);
        if (!pub) throw new Error('noble smoke-test failed: pointFromScalar returned falsy');
        backendImpl = nb;
        console.log('[inscribe] using @noble/secp256k1 on iOS (smoke-test OK)');
        console.log('初始化成功：', pub);
      } catch (e) {
        // On iOS we do NOT attempt to import any native backend to avoid HostFunction crashes.
        console.error(
          '[inscribe] failed to initialize @noble/secp256k1 on iOS; refusing to load native backend to avoid crash',
          e,
        );
        throw e;
      }
    }

    if (!backendImpl) {
      // Non-iOS platforms: try native-backed implementation first, then fallback to noble.
      try {
        const candidate = await import('@bitcoinerlab/secp256k1');
        // probe with a sample to ensure native functions work here
        try {
          const sample = randomBytesRN(32);
          if (typeof (candidate as any).pointFromScalar === 'function') {
            (candidate as any).pointFromScalar(new Uint8Array(sample), true);
          }
        } catch (probeErr) {
          throw probeErr;
        }
        backendImpl = { name: 'bitcoinerlab', impl: candidate } as any;
        try {
          bitcoin.initEccLib(candidate);
        } catch (e) {
          /* ignore */
        }
        console.log('[inscribe] using @bitcoinerlab/secp256k1');
      } catch (err) {
        // fallback to noble on non-iOS if native fails
        console.log(
          '[inscribe] native backend probe failed, falling back to @noble/secp256k1:',
          err,
        );
        try {
          const nb = await useNoble();
          backendImpl = nb;
          try {
            bitcoin.initEccLib(nb.impl as any);
            console.log('初始化iOS 111111：[wallet] forced @noble/secp256k1');
          } catch (e) {
            console.log('@noble initEccLib ignored:', e);
          }
          console.log('[inscribe] fallback to @noble/secp256k1');
        } catch (e) {
          console.error('[inscribe] failed to load any ecc backend', e);
          throw e;
        }
      }
    }

    // build ECPair-like wrappers
    const makeKeyPairFromPrivate = (privBuf: Buffer) => {
      const priv = new Uint8Array(privBuf);
      if (backendImpl.name === 'bitcoinerlab') {
        const pubarr = backendImpl.impl.pointFromScalar(priv, true);
        if (!pubarr) throw new Error('Failed to derive public key');
        return {
          privateKey: Buffer.from(privBuf),
          publicKey: Buffer.from(pubarr),
          sign: (hash: Buffer) => {
            const sig = backendImpl.impl.sign(new Uint8Array(hash), priv);
            return Buffer.from(sig instanceof Uint8Array ? sig.slice(0, 64) : sig);
          },
        };
      }

      // noble
      const pub = backendImpl.impl.pointFromScalar(priv, true);
      return {
        privateKey: Buffer.from(privBuf),
        publicKey: Buffer.from(pub),
        sign: async (hash: Buffer) => {
          const res = await backendImpl.impl.sign(new Uint8Array(hash), priv);
          if (res && typeof (res as any).then === 'function') {
            // async
            return (res as Promise<Uint8Array>).then((r) => Buffer.from(r.slice(0, 64)));
          }
          return Buffer.from((res as Uint8Array).slice(0, 64));
        },
      };
    };

    const fromWIF = (wif: string) => {
      const decoded = bs58check.decode(wif);
      const buf = Buffer.from(decoded);
      const priv = buf.slice(1, 33);
      return makeKeyPairFromPrivate(priv);
    };

    const makeRandom = () => {
      let priv: Uint8Array;
      console.log('makeRandom');
      try {
        do {
          // use randomBytesRN for RN compatibility
          priv = new Uint8Array(randomBytesRN(32));
        } while (!backendImpl.impl.isPrivate(new Uint8Array(priv)));
      } catch (e) {
        console.log('makeRandom2222：', e);
      }
      if (backendImpl.name === 'bitcoinerlab') {
        const pub = backendImpl.impl.pointFromScalar(new Uint8Array(priv), true);
        return {
          privateKey: Buffer.from(priv),
          publicKey: Buffer.from(pub),
          sign: (hash: Buffer) =>
            Buffer.from(
              backendImpl.impl.sign(new Uint8Array(hash), new Uint8Array(priv)).slice(0, 64),
            ),
        };
      }

      const pub = backendImpl.impl.pointFromScalar(new Uint8Array(priv), true);
      console.log('pub:', pub);
      return {
        privateKey: Buffer.from(priv),
        publicKey: Buffer.from(pub),
        sign: (hash: Buffer) => {
          const res = backendImpl.impl.sign(new Uint8Array(hash), new Uint8Array(priv));
          if (res && typeof (res as any).then === 'function') {
            return (res as Promise<Uint8Array>).then((r) => Buffer.from(r.slice(0, 64)));
          }
          return Buffer.from((res as Uint8Array).slice(0, 64));
        },
      };
    };

    ECPair = {
      makeRandom,
      fromWIF,
    };

    eccInitialized = true;
  }
  return ECPair;
}

const dogeMainnet: bitcoin.Network = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};

// DOGE 测试网参数
const dogeTestnet: bitcoin.Network = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x71,
  scriptHash: 0xc4,
  wif: 0xf1,
};

// 常量定义
const MAX_CHUNK_LEN = 240;
const MAX_PAYLOAD_LEN = 1500;
const DEFAULT_OUTPUT_VALUE = 1000000; // 0.01 DOGE
const DUST_LIMIT = 600; // DOGE dust limit

export type Operation = 'init' | 'create' | 'modify' | 'revoke';

export type MetaidData = {
  body?: string | Buffer;
  operation: Operation;
  path?: string;
  contentType?: string;
  encryption?: '0' | '1' | '2';
  version?: string;
  encoding?: BufferEncoding;
  revealAddr: string;
  flag?: 'metaid';
};

export type DogeUtxo = {
  txId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
  rawTx?: string;
  scriptPk?: string;
  privateKeyWIF?: string;
};

export type InscriptionRequest = {
  /** 费率，单位: satoshis/KB (每千字节) */
  feeRate: number;
  metaidDataList: MetaidData[];
  revealOutValue?: number;
  changeAddress?: string;
  service?: {
    address: string;
    satoshis: string;
  };
};

interface InscribeHexResult {
  commitTxHex: string;
  revealTxsHex: string[];
  commitCost: number;
  revealCost: number;
  totalCost: number;
}

interface InscribeTxIdResult {
  commitTxId: string;
  revealTxIds: string[];
  commitCost: number;
  revealCost: number;
  totalCost: number;
}

/**
 * 计算 HASH160 (RIPEMD160(SHA256(data)))
 */
function hash160(data: Buffer): Buffer {
  return bitcoin.crypto.hash160(data);
}

/**
 * 添加 push data 到脚本
 * 根据数据长度选择正确的操作码
 */
function pushData(data: Buffer): Buffer {
  const len = data.length;
  if (len === 0) {
    return Buffer.from([bitcoin.opcodes.OP_0]);
  } else if (len < 76) {
    // 直接使用长度作为操作码
    return Buffer.concat([Buffer.from([len]), data]);
  } else if (len <= 0xff) {
    return Buffer.concat([Buffer.from([bitcoin.opcodes.OP_PUSHDATA1, len]), data]);
  } else if (len <= 0xffff) {
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16LE(len);
    return Buffer.concat([Buffer.from([bitcoin.opcodes.OP_PUSHDATA2]), lenBuf, data]);
  } else {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32LE(len);
    return Buffer.concat([Buffer.from([bitcoin.opcodes.OP_PUSHDATA4]), lenBuf, data]);
  }
}

/**
 * 构建 MetaID 格式的 inscription 脚本
 * 字段顺序: metaid, operation, contentType, encryption, version, path, body
 */
function buildMetaIdInscriptionScript(data: MetaidData): Buffer {
  const body =
    typeof data.body === 'string'
      ? Buffer.from(data.body, data.encoding || 'utf8')
      : data.body || Buffer.alloc(0);

  // 将 body 数据分块
  const bodyParts: Buffer[] = [];
  for (let i = 0; i < body.length; i += MAX_CHUNK_LEN) {
    bodyParts.push(body.slice(i, Math.min(i + MAX_CHUNK_LEN, body.length)));
  }

  // 如果 body 为空，添加一个空的 part
  if (bodyParts.length === 0) {
    bodyParts.push(Buffer.alloc(0));
  }

  // 构建 inscription 脚本
  // 顺序: metaid, operation, contentType, encryption, version, path, body
  const chunks: Buffer[] = [];

  // 1. metaid (标识符)
  chunks.push(pushData(Buffer.from('metaid')));

  // 2. operation (操作类型)
  chunks.push(pushData(Buffer.from(data.operation)));

  // 3. contentType (内容类型)
  chunks.push(pushData(Buffer.from(data.contentType || 'text/plain')));

  // 4. encryption (加密标志)
  chunks.push(pushData(Buffer.from(data.encryption || '0')));

  // 5. version (版本)
  chunks.push(pushData(Buffer.from(data.version || '0.0.1')));

  // 6. path (路径)
  chunks.push(pushData(Buffer.from(data.path || '')));

  // 7. body (内容，可能有多个分块)
  for (const part of bodyParts) {
    chunks.push(pushData(part));
  }

  return Buffer.concat(chunks);
}

/**
 * 计算脚本中的 chunk 数量
 * 用于确定需要多少个 OP_DROP
 */
function countScriptChunks(script: Buffer): number {
  let count = 0;
  let i = 0;

  while (i < script.length) {
    const opcode = script[i];

    if (opcode === 0) {
      // OP_0
      count++;
      i++;
    } else if (opcode >= 1 && opcode <= 75) {
      // 直接 push opcode 个字节
      count++;
      i += 1 + opcode;
    } else if (opcode === bitcoin.opcodes.OP_PUSHDATA1) {
      const len = script[i + 1];
      count++;
      i += 2 + len;
    } else if (opcode === bitcoin.opcodes.OP_PUSHDATA2) {
      const len = script[i + 1] | (script[i + 2] << 8);
      count++;
      i += 3 + len;
    } else if (opcode === bitcoin.opcodes.OP_PUSHDATA4) {
      const len =
        script[i + 1] | (script[i + 2] << 8) | (script[i + 3] << 16) | (script[i + 4] << 24);
      count++;
      i += 5 + len;
    } else {
      // 其他操作码
      i++;
    }
  }

  return count;
}

/**
 * 构建 Lock 脚本 (Redeem Script)
 * 结构: <pubkey> OP_CHECKSIGVERIFY OP_DROP OP_DROP ... OP_TRUE
 */
function buildLockScript(publicKey: Buffer, inscriptionScript: Buffer): Buffer {
  const chunks: Buffer[] = [];

  // 1. 添加公钥
  chunks.push(pushData(publicKey));

  // 2. 添加 OP_CHECKSIGVERIFY
  chunks.push(Buffer.from([bitcoin.opcodes.OP_CHECKSIGVERIFY]));

  // 3. 为 inscription 脚本中的每个 chunk 添加 OP_DROP
  const dropCount = countScriptChunks(inscriptionScript);
  for (let i = 0; i < dropCount; i++) {
    chunks.push(Buffer.from([bitcoin.opcodes.OP_DROP]));
  }

  // 4. 添加 OP_TRUE
  chunks.push(Buffer.from([bitcoin.opcodes.OP_TRUE]));

  return Buffer.concat(chunks);
}

/**
 * 构建 P2SH 输出脚本
 * 结构: OP_HASH160 <hash160(lockScript)> OP_EQUAL
 */
function buildP2SHOutputScript(lockScript: Buffer): Buffer {
  const lockHash = hash160(lockScript);
  return Buffer.concat([
    Buffer.from([bitcoin.opcodes.OP_HASH160]),
    pushData(lockHash),
    Buffer.from([bitcoin.opcodes.OP_EQUAL]),
  ]);
}

/**
 * 构建 P2PKH 输出脚本
 */
function buildP2PKHOutputScript(address: string, network: bitcoin.Network): Buffer {
  const decoded = bitcoin.address.fromBase58Check(address);
  return Buffer.concat([
    Buffer.from([bitcoin.opcodes.OP_DUP, bitcoin.opcodes.OP_HASH160]),
    pushData(decoded.hash),
    Buffer.from([bitcoin.opcodes.OP_EQUALVERIFY, bitcoin.opcodes.OP_CHECKSIG]),
  ]);
}

/**
 * 估算交易大小
 */
function estimateTxSize(
  p2pkhInputCount: number,
  outputCount: number,
  p2shUnlockScriptSize: number = 0,
): number {
  // 版本 (4) + locktime (4) + 输入计数 (1-3) + 输出计数 (1-3)
  let size = 10;

  // P2SH 输入: 32 (txid) + 4 (vout) + varint + unlockScript + 4 (sequence)
  if (p2shUnlockScriptSize > 0) {
    size += 32 + 4 + 3 + p2shUnlockScriptSize + 4;
  }

  // P2PKH 输入: 约 148 字节
  size += p2pkhInputCount * 148;

  // 输出: 约 34 字节
  size += outputCount * 34;

  return size;
}

/**
 * 选择 UTXO 来支付交易
 * 注意: DOGE 的 feeRate 单位是 satoshis/KB (每千字节)
 */
function selectUtxos(
  availableUtxos: DogeUtxo[],
  targetAmount: number,
  feeRate: number,
  outputCount: number,
  p2shUnlockScriptSize: number = 0,
): { selectedUtxos: DogeUtxo[]; fee: number; totalInput: number } {
  const selectedUtxos: DogeUtxo[] = [];
  let totalInput = 0;

  // 按金额降序排序
  const sortedUtxos = [...availableUtxos].sort((a, b) => b.satoshis - a.satoshis);

  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo);
    totalInput += utxo.satoshis;

    const txSize = estimateTxSize(selectedUtxos.length, outputCount, p2shUnlockScriptSize);
    // feeRate 单位是 sat/KB，需要转换为实际费用
    // fee = txSize(bytes) * feeRate(sat/KB) / 1000
    const fee = Math.ceil((txSize * feeRate) / 1000);

    if (totalInput >= targetAmount + fee) {
      return { selectedUtxos, fee, totalInput };
    }
  }

  throw new Error(`Insufficient funds: need ${targetAmount}, have ${totalInput}`);
}

/**
 * 对 P2PKH 输入签名
 */
async function signP2PKHInput(
  tx: bitcoin.Transaction,
  inputIndex: number,
  keyPair: any,
  prevOutputScript: Buffer,
): Promise<Buffer> {
  const sigHash = tx.hashForSignature(
    inputIndex,
    prevOutputScript,
    bitcoin.Transaction.SIGHASH_ALL,
  );
  console.log('sigHash  P2PKH : ', sigHash.toString('hex'));
  const sig64 = await keyPair.sign(sigHash); // 64字节 R||S
  console.log('sig64  P2PKH : ', sig64.toString('hex'));
  const signatureDER = compactToCanonicalDer(sig64);

  // if (Platform.OS == 'ios') {
  //   return Buffer.concat([pushData(sig64), pushData(keyPair.publicKey)]);
  // }

  return Buffer.concat([pushData(signatureDER), pushData(keyPair.publicKey)]);
}

async function signP2SHInput(
  tx: bitcoin.Transaction,
  inputIndex: number,
  keyPair: any,
  lockScript: Buffer,
  inscriptionScript: Buffer,
): Promise<Buffer> {
  console.log('signP2SHInput', '签名交易');

  // 1️⃣ 计算 sighash
  const sigHash = tx.hashForSignature(inputIndex, lockScript, bitcoin.Transaction.SIGHASH_ALL);
  const sig64 = await keyPair.sign(sigHash); // 64字节 R||S
  console.log('ios 签名结果：', sig64);
  const signatureDER = compactToCanonicalDer(sig64);

  // if (Platform.OS == 'ios') {
  //   return Buffer.concat([inscriptionScript, pushData(sig64), pushData(lockScript)]);
  // }
  return Buffer.concat([inscriptionScript, pushData(signatureDER), pushData(lockScript)]);
}

// async function signP2SHInput(
//   tx: bitcoin.Transaction,
//   inputIndex: number,
//   keyPair: any,
//   redeemScript: Buffer,
//   inscriptionScript: Buffer,
// ): Promise<Buffer> {
//   const sigHash = tx.hashForSignature(inputIndex, redeemScript, bitcoin.Transaction.SIGHASH_ALL);
//   const sig64 = await keyPair.sign(sigHash);
//   const sigDER = compactToCanonicalDer(sig64);

//     // 手动构建 scriptSig：push(signature) + inscription chunks + push(redeemScript)
//     const parts: Buffer[] = [];
//     parts.push(pushData(sigDER));
//     for (const part of splitInscriptionChunks(inscriptionScript)) parts.push(part);
//     parts.push(pushData(redeemScript));
//     const scriptSig = Buffer.concat([Buffer.from([bitcoin.opcodes.OP_0]), ...parts]);
//     console.log('scriptSig hex:', scriptSig.toString('hex'));
//     return scriptSig;
// }

// async function signP2SHInput(
//   tx: bitcoin.Transaction,
//   inputIndex: number,
//   keyPair: any,
//   redeemScript: Buffer,
//   inscriptionScript: Buffer,
// ): Promise<Buffer> {
//   const sigHash = tx.hashForSignature(inputIndex, redeemScript, bitcoin.Transaction.SIGHASH_ALL);
//   const sig64 = await keyPair.sign(sigHash);
//   const sigDER = compactToCanonicalDer(sig64);

//   // ⚠️ 重点：dummy OP_0 必须放最前面
//   // const scriptSig = Buffer.concat([
//   //   Buffer.from([bitcoin.opcodes.OP_0]), // 👈 这里是 dummy
//   //   pushData(sigDER), // 👈 签名
//   //   // inscriptionScript,                  // 👈 铭刻数据
//   //   pushData(redeemScript), // 👈 redeemScript 原样 push
//   // ]);

//   // 使用 script.compile 自动生成 push
//   const scriptSig = script.compile([
//     opcodes.OP_0,     // dummy
//     sigDER,           // 签名
//     inscriptionScript,
//     redeemScript,     // redeemScript 原样
//   ]);
//   console.log('scriptSig hex:', scriptSig.toString('hex'));
//   return scriptSig;
// }

/**
 * 将 64 字节 R||S 签名转换为 canonical DER + SIGHASH_ALL
 */
function compactToCanonicalDer(sig64: Buffer): Buffer {
  // Ensure low-S form to improve max compatibility with node policy checks
  // Normalize s to <= n/2 when possible (works when using @noble/secp256k1)
  function ensureLowS(sig: Buffer): Buffer {
    try {
      const r = sig.slice(0, 32);
      let s = sig.slice(32, 64);

      // try to read curve order from noble implementation
      const n: bigint | undefined = (secp256k1 as any)?.CURVE?.n ?? (secp256k1 as any)?.n;
      if (!n) return sig;

      const sBig = BigInt('0x' + s.toString('hex'));
      const half = n / BigInt(2);
      if (sBig > half) {
        const newS = n - sBig;
        // pad to 32 bytes
        let hex = newS.toString(16);
        if (hex.length % 2) hex = '0' + hex;
        hex = hex.padStart(64, '0');
        s = Buffer.from(hex, 'hex');
      }
      return Buffer.concat([r, s]);
    } catch (e) {
      return sig;
    }
  }

  const normalized = ensureLowS(sig64);
  const r = normalized.slice(0, 32);
  const s = normalized.slice(32, 64);

  const trim = (b: Buffer) => {
    let i = 0;
    while (i < b.length - 1 && b[i] === 0) i++;
    if (b[i] & 0x80) return Buffer.concat([Buffer.from([0x00]), b.slice(i)]);
    return b.slice(i);
  };

  const rb = trim(r);
  const sb = trim(s);

  const rHeader = Buffer.from([0x02, rb.length]);
  const sHeader = Buffer.from([0x02, sb.length]);
  const sequenceLen = rHeader.length + rb.length + sHeader.length + sb.length;
  const der = Buffer.concat([Buffer.from([0x30, sequenceLen]), rHeader, rb, sHeader, sb]);

  // append SIGHASH_ALL
  return Buffer.concat([der, Buffer.from([bitcoin.Transaction.SIGHASH_ALL])]);
}

/**
 * 构建 DOGE MetaID Inscription 交易
 *
 * @param metaidData - MetaID 数据
 * @param utxos - 可用的 UTXO
 * @param walletKeyPair - 钱包密钥对
 * @param feeRate - 费率 (satoshis/byte)
 * @param changeAddress - 找零地址
 * @param network - 网络参数
 * @param revealOutValue - reveal 输出金额
 * @param ECPairInstance - ECPair 实例
 */
async function buildDogeInscriptionTxs(
  metaidData: MetaidData,
  utxos: DogeUtxo[],
  walletKeyPair: any,
  feeRate: number, // satoshis/KB
  changeAddress: string,
  network: bitcoin.Network,
  revealOutValue: number = DEFAULT_OUTPUT_VALUE,
  ECPairInstance: any,
): Promise<{
  commitTx: bitcoin.Transaction;
  revealTx: bitcoin.Transaction;
  commitFee: number;
  revealFee: number;
}> {
  console.log('buildDogeInscriptionTxs');
  // 1. 生成临时密钥对用于 P2SH
  const tempKeyPair = ECPairInstance.makeRandom({ network });
  console.log('tempKeyPair', tempKeyPair);

  const tempPublicKey = tempKeyPair.publicKey;

  console.log('tempPublicKey: ', tempPublicKey.toString('hex'));

  // 2. 构建 inscription 脚本
  const inscriptionScript = buildMetaIdInscriptionScript(metaidData);
  console.log('inscriptionScript: ', inscriptionScript.toString('hex'));

  // 3. 构建 lock 脚本 (redeem script)
  const lockScript = buildLockScript(tempPublicKey, inscriptionScript);
  console.log('lockScript: ', lockScript.toString('hex'));

  // 4. 构建 P2SH 输出脚本
  const p2shOutputScript = buildP2SHOutputScript(lockScript);
  console.log('p2shOutputScript: ', p2shOutputScript.toString('hex'));

  // 估算 P2SH unlock 脚本大小
  const estimatedUnlockSize = inscriptionScript.length + 72 + lockScript.length + 10;

  // ===== 构建 Commit 交易 =====
  const commitTx = new bitcoin.Transaction();
  commitTx.version = 2;

  // 添加 P2SH 输出
  commitTx.addOutput(p2shOutputScript, DEFAULT_OUTPUT_VALUE);

  // 选择 UTXO 来支付 commit 交易
  const {
    selectedUtxos: commitUtxos,
    fee: commitFee,
    totalInput: commitTotalInput,
  } = selectUtxos(
    utxos,
    DEFAULT_OUTPUT_VALUE,
    feeRate,
    2, // P2SH 输出 + 找零输出
    0,
  );

  // 添加 UTXO 输入
  for (const utxo of commitUtxos) {
    const txIdBuffer = Buffer.from(utxo.txId, 'hex').reverse();
    commitTx.addInput(txIdBuffer, utxo.outputIndex);
  }

  // 计算找零
  const commitChange = commitTotalInput - DEFAULT_OUTPUT_VALUE - commitFee;
  if (commitChange >= DUST_LIMIT) {
    const changeScript = buildP2PKHOutputScript(changeAddress, network);
    commitTx.addOutput(changeScript, commitChange);
  }

  console.log('commitTx 准备签名：', commitTx.toHex());

  // 签名 commit 交易的输入
  for (let i = 0; i < commitUtxos.length; i++) {
    const utxo = commitUtxos[i];
    const prevOutputScript = buildP2PKHOutputScript(utxo.address, network);
    const sigScript = await signP2PKHInput(commitTx, i, walletKeyPair, prevOutputScript);
    commitTx.setInputScript(i, sigScript);
  }

  // ===== 构建 Reveal 交易 =====
  const revealTx = new bitcoin.Transaction();
  revealTx.version = 2;

  // 添加 P2SH 输入 (来自 commit 交易的输出)
  const commitTxId = commitTx.getId();
  const commitTxIdBuffer = Buffer.from(commitTxId, 'hex').reverse();
  revealTx.addInput(commitTxIdBuffer, 0); // P2SH 输出在索引 0

  // 添加输出到目标地址
  const revealOutputScript = buildP2PKHOutputScript(metaidData.revealAddr, network);
  revealTx.addOutput(revealOutputScript, revealOutValue);

  // 更新可用 UTXO 列表 (移除已使用的，添加找零)
  let availableUtxos = utxos.filter((u) => !commitUtxos.includes(u));
  if (commitChange >= DUST_LIMIT) {
    availableUtxos.push({
      txId: commitTxId,
      outputIndex: commitTx.outs.length - 1,
      satoshis: commitChange,
      address: changeAddress,
    });
  }

  // 选择 UTXO 来支付 reveal 交易手续费
  const p2shInputAmount = DEFAULT_OUTPUT_VALUE;
  const {
    selectedUtxos: revealUtxos,
    fee: revealFee,
    totalInput: revealTotalInput,
  } = selectUtxos(
    availableUtxos,
    revealOutValue - p2shInputAmount, // P2SH 输入已经提供了一部分金额
    feeRate,
    2, // 输出 + 找零
    estimatedUnlockSize,
  );

  // 添加额外的 UTXO 输入
  for (const utxo of revealUtxos) {
    const txIdBuffer = Buffer.from(utxo.txId, 'hex').reverse();
    revealTx.addInput(txIdBuffer, utxo.outputIndex);
  }

  // 计算找零
  const revealChange = p2shInputAmount + revealTotalInput - revealOutValue - revealFee;
  if (revealChange >= DUST_LIMIT) {
    const changeScript = buildP2PKHOutputScript(changeAddress, network);
    revealTx.addOutput(changeScript, revealChange);
  }

  // 先签名 P2PKH 输入 (从索引 1 开始)
  for (let i = 0; i < revealUtxos.length; i++) {
    const utxo = revealUtxos[i];
    const prevOutputScript = buildP2PKHOutputScript(utxo.address, network);
    const sigScript = await signP2PKHInput(revealTx, i + 1, walletKeyPair, prevOutputScript);
    revealTx.setInputScript(i + 1, sigScript);
  }

  const redeemScript = lockScript; // 你的 redeemScript 其实就是 lockScript
  // 最后签名 P2SH 输入 (索引 0)
  const unlockScript = await signP2SHInput(
    revealTx,
    0,
    tempKeyPair,
    redeemScript,
    inscriptionScript,
  );

  revealTx.setInputScript(0, unlockScript);

  // 2. 把铭刻内容放入 OP_RETURN output
  // const opReturnScript = Buffer.concat([
  //   Buffer.from([bitcoin.opcodes.OP_RETURN]),
  //   inscriptionScript,
  // ]);

  // revealTx.addOutput(opReturnScript, 0); // 金额 0 代表纯数据输出

  // // 3. 追加一个找零 output（防 dust）
  // const changeScript = buildP2PKHOutputScript(changeAddress, network);
  // revealTx.addOutput(changeScript, 10000000);

  console.log('Reveal input[0] scriptSig:', revealTx.ins[0].script.toString('hex'));

  return { commitTx, revealTx, commitFee, revealFee };
}

function initOptions() {
  return { noBroadcast: false };
}

/**
 * DOGE inscribe 主入口函数
 * 类似于 BTC 的 inscribe.process
 */
export async function process({
  data: { metaidDataList, service, feeRate, revealOutValue },
  options = initOptions(),
}: {
  data: InscriptionRequest;
  options?: { noBroadcast: boolean };
}): Promise<InscribeHexResult | InscribeTxIdResult> {
  console.log('inscribe.process');
  // 确保 ecc 库已初始化（动态导入，避免与 bitcore-lib 冲突）
  const ECPairInstance = await ensureEccInitialized();
  console.log('inscribe.process1111' + JSON.stringify(ECPairInstance));

  // 获取当前 DOGE 钱包
  const wallet = await getDogeWallet();
  console.log('inscribe.process2222');

  const address = wallet.getAddress();
  console.log('inscribe.process3333');

  const privateKeyWIF = wallet.getPrivateKeyWIF();
  console.log('inscribe.process4444' + privateKeyWIF);

  const network = wallet.getNetwork();
  console.log('inscribe.process5555' + network);

  // 创建钱包密钥对
  const walletKeyPair = ECPairInstance.fromWIF(privateKeyWIF, network);
  console.log('inscribe.process666' + walletKeyPair);

  // 获取 UTXO
  const rawUtxos = await fetchDogeUtxos(address, true);

  // console.log('rawUtxos:', rawUtxos);
  const utxos: DogeUtxo[] = rawUtxos.map((utxo: any) => ({
    txId: utxo.txId,
    outputIndex: utxo.outputIndex,
    satoshis: utxo.satoshis,
    address: utxo.address || address,
    rawTx: utxo.rawTx,
  }));

  if (utxos.length === 0) {
    throw new Error('No UTXOs available');
  }

  let totalCommitCost = 0;
  let totalRevealCost = 0;
  const commitTxs: bitcoin.Transaction[] = [];
  const revealTxs: bitcoin.Transaction[] = [];

  // 为每个 metaidData 构建交易
  let availableUtxos = [...utxos];

  for (const metaidData of metaidDataList) {
    const { commitTx, revealTx, commitFee, revealFee } = await buildDogeInscriptionTxs(
      metaidData,
      availableUtxos,
      walletKeyPair,
      feeRate,
      address, // 使用钱包地址作为找零地址
      network,
      revealOutValue || DEFAULT_OUTPUT_VALUE,
      ECPairInstance,
    );

    commitTxs.push(commitTx);
    revealTxs.push(revealTx);
    totalCommitCost += commitFee;
    totalRevealCost += revealFee;

    // 更新可用 UTXO (简化处理，实际应该根据交易输出更新)
    // 这里假设每笔交易后 UTXO 会被消耗
  }

  const totalCost = totalCommitCost + totalRevealCost + (service ? parseInt(service.satoshis) : 0);

  console.log('准备广播');
  if (!options.noBroadcast) {
    // 广播所有交易
    const commitTxIds: string[] = [];
    const revealTxIds: string[] = [];

    for (let i = 0; i < commitTxs.length; i++) {
      // 广播 commit 交易
      const commitTxId = await broadcastDogeTx(commitTxs[i].toHex());
      commitTxIds.push(commitTxId);

      // 广播 reveal 交易
      const revealTxId = await broadcastDogeTx(revealTxs[i].toHex());
      revealTxIds.push(revealTxId);
    }

    return {
      commitTxId: commitTxIds[0],
      revealTxIds,
      commitCost: totalCommitCost,
      revealCost: totalRevealCost,
      totalCost,
    };
  }
  return {
    commitTxHex: commitTxs[0]?.toHex() || '',
    revealTxsHex: revealTxs.map((tx) => tx.toHex()),
    commitCost: totalCommitCost,
    revealCost: totalRevealCost,
    totalCost,
  };
}
