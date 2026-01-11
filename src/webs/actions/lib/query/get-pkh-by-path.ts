import * as bip32 from "@scure/bip32";
// Don't statically import native ecc; dynamic import and fallback at runtime to avoid iOS native crashes
let _ecc: any = null;
async function ensureEcc() {
  if (_ecc) return _ecc;
  // prefer noble on iOS to avoid native JSI HostFunction crashes
  try {
    const { Platform } = await import('react-native');
    if (Platform.OS === 'ios') {
      const noble = await import('@noble/secp256k1');
      _ecc = noble as any;
      console.log('[get-pkh] forced @noble/secp256k1 on iOS');
      return _ecc;
    }
  } catch (e) {
    // if react-native import fails, continue to fallback logic
  }

  try {
    const candidate = await import('@bitcoinerlab/secp256k1');
    try {
      const sample = new Uint8Array(32);
      if (typeof (candidate as any).pointFromScalar === 'function') {
        (candidate as any).pointFromScalar(sample, true);
      }
      _ecc = candidate as any;
      console.log('[get-pkh] using @bitcoinerlab/secp256k1');
      return _ecc;
    } catch (e) {
      // probe failed, fall through to noble
    }
  } catch (e) {
    // import failed, fall back to noble
  }

  const noble = await import('@noble/secp256k1');
  _ecc = noble as any;
  console.log('[get-pkh] fallback to @noble/secp256k1');
  return _ecc;
}
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


