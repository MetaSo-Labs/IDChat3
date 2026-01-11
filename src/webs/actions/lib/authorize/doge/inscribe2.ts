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

// Convert 64-byte compact signature (r||s) to DER
function compactToDer(sigCompact: Uint8Array | Buffer): Buffer {
  const sig = sigCompact instanceof Buffer ? sigCompact : Buffer.from(sigCompact);
  const r = sig.slice(0, 32);
  const s = sig.slice(32, 64);

  const trim = (b: Buffer) => {
    let i = 0;
    while (i < b.length - 1 && b[i] === 0) i++;
    return b.slice(i);
  };

  const rb = trim(r);
  const sb = trim(s);

  const rHeader = Buffer.from([0x02, rb.length]);
  const sHeader = Buffer.from([0x02, sb.length]);
  const sequenceLen = rHeader.length + rb.length + sHeader.length + sb.length;
  return Buffer.concat([Buffer.from([0x30, sequenceLen]), rHeader, rb, sHeader, sb]);
}

// RN-friendly secure random bytes helper
function randomBytesRN(size: number): Buffer {
  // Prefer Web Crypto API if available (React Native 0.66+ with crypto polyfill or expo)
  if (
    typeof (globalThis as any).crypto === 'object' &&
    typeof (globalThis as any).crypto.getRandomValues === 'function'
  ) {
    const buf = Buffer.alloc(size);
    (globalThis as any).crypto.getRandomValues(buf);
    return buf;
  }

  // Try react-native-get-random-values if installed
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getRandomBytes } = require('react-native-get-random-values');
    const rand = getRandomBytes(size);
    return Buffer.from(rand);
  } catch (e) {
    // fallback to insecure Math.random (not recommended for production)
    const buf = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      buf[i] = Math.floor(Math.random() * 256);
    }
    return buf;
  }
}
import { broadcastDogeTx, fetchDogeUtxos } from '../../../../../queries/doge';
import { getDogeWallet } from '@/chat/wallet/doge/wallet';
import { sleep } from '@/lib/helpers';
import { Platform } from 'react-native';

// 延迟初始化，避免在模块加载时就导入 @bitcoinerlab/secp256k1
// 这样可以避免与 bitcore-lib 的 crypto 模块冲突
let ECPair: any | null = null;
let eccInitialized = false;

async function ensureEccInitialized() {
  if (!eccInitialized) {
    // For iOS force using noble to avoid native JSI crashes
    if (Platform.OS === 'ios') {
      const noble = await import('@noble/secp256k1');
      // build minimal impl compatible with other code
      const impl = {
        pointFromScalar: (d: Uint8Array, compressed = true) => Buffer.from(noble.getPublicKey(d, compressed)),
        isPrivate: (d: Uint8Array) => noble.utils.isValidSecretKey(d),
        sign: async (msg: Uint8Array, priv: Uint8Array) => Buffer.from(await noble.sign(msg, priv)),
      };
      ECPair = {
        makeRandom: () => {
          // ... keep existing behavior minimal
          const priv = new Uint8Array(32).fill(1);
          const pub = impl.pointFromScalar(priv, true);
          return { privateKey: Buffer.from(priv), publicKey: Buffer.from(pub), sign: (h: Buffer) => Buffer.from((impl.sign as any)(new Uint8Array(h), priv)) };
        },
        fromWIF: (wif: string) => {
          const decoded = bs58check.decode(wif);
          const priv = Buffer.from(decoded).slice(1, 33);
          const pub = impl.pointFromScalar(new Uint8Array(priv), true);
          return { privateKey: Buffer.from(priv), publicKey: Buffer.from(pub), sign: (h: Buffer) => Buffer.from((impl.sign as any)(new Uint8Array(h), new Uint8Array(priv))) };
        },
      } as any;
      eccInitialized = true;
      return ECPair;
    }
    // 非 iOS 平台尽量使用 native 后端
    const ecc = await import('@bitcoinerlab/secp256k1');
    bitcoin.initEccLib(ecc);

    // Create a lightweight ECPair-compatible interface using ecc, bs58check and crypto
    const compactToDer = (sigCompact: Uint8Array) => {
      const r = sigCompact.slice(0, 32);
      const s = sigCompact.slice(32, 64);

      const trim = (b: Uint8Array) => {
        let i = 0;
        while (i < b.length - 1 && b[i] === 0) i++;
        return b.slice(i);
      };

      const rb = trim(r);
      const sb = trim(s);

      const rHeader = Buffer.from([0x02, rb.length]);
      const sHeader = Buffer.from([0x02, sb.length]);
      const sequenceLen = rHeader.length + rb.length + sHeader.length + sb.length;
      return Buffer.concat([
        Buffer.from([0x30, sequenceLen]),
        rHeader,
        Buffer.from(rb),
        sHeader,
        Buffer.from(sb),
      ]);
    };

    const makeKeyPairFromPrivate = (privBuf: Buffer) => {
      const priv = new Uint8Array(privBuf);
      const pubarr = ecc.pointFromScalar(priv, true);
      if (!pubarr) throw new Error('Failed to derive public key');
      const publicKey = Buffer.from(pubarr);

      return {
        privateKey: Buffer.from(privBuf),
        publicKey,
        // return compact 64-byte signature r||s
        sign: (hash: Buffer) => {
          const sig = ecc.sign(new Uint8Array(hash), priv);
          return Buffer.from(sig);
        },
      };
    };

    const fromWIF = (wif: string, network: bitcoin.Network) => {
      const decodedBuf = Buffer.from(bs58check.decode(wif));
      // decoded: <version:1><priv:32>[<compressed:1>]
      const version = decodedBuf[0];
      let compressed = false;
      let priv: Buffer;
      if (decodedBuf.length === 34) {
        // has compression flag
        compressed = decodedBuf[33] === 0x01;
        priv = decodedBuf.slice(1, 33);
      } else {
        priv = decodedBuf.slice(1, 33);
      }
      return makeKeyPairFromPrivate(priv);
    };

    const makeRandom = (opts?: { network?: bitcoin.Network }) => {
      let priv: Buffer;
      do {
        priv = randomBytesRN(32);
      } while (!ecc.isPrivate(new Uint8Array(priv)));
      return makeKeyPairFromPrivate(priv);
    };

    ECPair = {
      makeRandom,
      fromWIF,
    };

    eccInitialized = true;
  }
  return ECPair!;
}

// DOGE 主网参数
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
  const sig64 = await Promise.resolve(keyPair.sign(sigHash)); // 64字节 R||S
  const signatureDER = compactToCanonicalDer(sig64 instanceof Buffer ? sig64 : Buffer.from(sig64));

  return Buffer.concat([pushData(signatureDER), pushData(keyPair.publicKey)]);
}

/**
 * 对 P2SH 输入签名
 */
async function signP2SHInput(
  tx: bitcoin.Transaction,
  inputIndex: number,
  keyPair: any,
  lockScript: Buffer,
  inscriptionScript: Buffer,
): Promise<Buffer> {
  const sigHash = tx.hashForSignature(inputIndex, lockScript, bitcoin.Transaction.SIGHASH_ALL);
  const sig64 = await Promise.resolve(keyPair.sign(sigHash));
  const signatureDER = compactToCanonicalDer(sig64 instanceof Buffer ? sig64 : Buffer.from(sig64));

  // 构建 unlock 脚本: <inscription_data> <signature> <lock_script>
  return Buffer.concat([inscriptionScript, pushData(signatureDER), pushData(lockScript)]);
}

/**
 * 将 64 字节 R||S 签名转换为 canonical DER + SIGHASH_ALL
 */
function compactToCanonicalDer(sig64: Buffer): Buffer {
  const r = sig64.slice(0, 32);
  const s = sig64.slice(32, 64);

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

  // 添加 SIGHASH_ALL
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
  // 1. 生成临时密钥对用于 P2SH
  const tempKeyPair = ECPairInstance.makeRandom({ network });
  const tempPublicKey = tempKeyPair.publicKey;

  // 2. 构建 inscription 脚本
  const inscriptionScript = buildMetaIdInscriptionScript(metaidData);

  // 3. 构建 lock 脚本 (redeem script)
  const lockScript = buildLockScript(tempPublicKey, inscriptionScript);

  // 4. 构建 P2SH 输出脚本
  const p2shOutputScript = buildP2SHOutputScript(lockScript);

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

  // 签名 commit 交易的输入
  for (let i = 0; i < commitUtxos.length; i++) {
    const utxo = commitUtxos[i];
    const prevOutputScript = buildP2PKHOutputScript(utxo.address, network);
    const sigScript = await signP2PKHInput(commitTx, i, walletKeyPair, prevOutputScript);
    commitTx.setInputScript(i, sigScript as Buffer);
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
    revealTx.setInputScript(i + 1, sigScript as Buffer);
  }

  // 最后签名 P2SH 输入 (索引 0)
  const unlockScript = await signP2SHInput(revealTx, 0, tempKeyPair, lockScript, inscriptionScript);
  revealTx.setInputScript(0, unlockScript as Buffer);

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

  sleep(5000);
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

  // 返回原始交易 hex
  return {
    commitTxHex: commitTxs[0]?.toHex() || '',
    revealTxsHex: revealTxs.map((tx) => tx.toHex()),
    commitCost: totalCommitCost,
    revealCost: totalRevealCost,
    totalCost,
  };
}
