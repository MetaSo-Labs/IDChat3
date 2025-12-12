import * as bip32 from "@scure/bip32";
import * as ecc from '@bitcoinerlab/secp256k1';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as hash from 'hash.js';
import { getActiveWallet } from '@/lib/wallet';

export async function process(
  { path = "m/100/0" }: { path?: string },
  { password }: { password: string }
) {
  // 获取钱包助记词
  const activeWallet = await getActiveWallet();
  // const mnemonic = decrypt(activeWallet.mnemonic, password);
  const mnemonic = activeWallet.mnemonic;

  // 生成种子
  const seed = mnemonicToSeedSync(mnemonic); // Uint8Array

  // 使用 scure/bip32 + ecc 派生子密钥
  const root = bip32.HDKey.fromMasterSeed(seed);
  const child = root.derive(path);

  // 获取压缩公钥
  const pubKey = child.publicKey; // Uint8Array

  // SHA256
  const sha256 = hash.sha256().update(pubKey).digest();

  // RIPEMD160
  const pkh = hash.ripemd160().update(Buffer.from(sha256)).digest('hex');
  console.log("Derived PKH:", pkh);

  return pkh; // 返回 hex 字符串
}


