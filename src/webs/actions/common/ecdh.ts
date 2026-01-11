// import * as crypto from "crypto";
// import * as elliptic from "elliptic";
import { ec as EC } from 'elliptic';
import { Buffer } from 'buffer';
import { getBtcNetwork, getNetwork } from '@/lib/network';
import { decrypt } from '@/lib/crypto';
import { getActiveWallet } from '@/lib/wallet';
import { AddressType, BaseWallet, ScriptType } from '@metalet/utxo-wallet-service';
import { getStorageCurrentWallet } from '@/utils/WalletUtils';

export async function process(
  { path = "m/100'/0'/0'/0/0", externalPubKey }: { path?: string; externalPubKey: string },
  // { password }: { password: string }
) {
  // const network = getNet()
  // console.log('调用ECDH：' + externalPubKey);

  const network = getNetwork();
  const activeWallet = await getActiveWallet();
  // const mnemonic = decrypt(activeWallet.mnemonic, password);
  const mnemonic = activeWallet.mnemonic;
  const wallet = new BaseWallet({
    // @ts-ignore
    path,
    network,
    mnemonic,
    addressIndex: 0,
    scriptType: ScriptType.P2PKH,
    addressType: AddressType.Legacy,
  });

  let sharedKey = '';
  let sharedSecret = '';
  let pubKeyObj;
  let keyPair;

  try {
    // 获取私钥
    const privateKey = wallet.getPrivateKeyBuffer();

    if (!privateKey || privateKey.length !== 32) {
      throw new Error('Invalid private key format.');
    }

    // console.log("privateKey", privateKey.toString("hex"));
    // console.log("externalPubKey", externalPubKey);

    // 验证 externalPubKey 格式
    // if (!externalPubKey.startsWith("04") || externalPubKey.length !== 130) {
    //   throw new Error(
    //     "Invalid externalPubKey format. Expected uncompressed public key."
    //   );
    // }

    // const _externalPubKey = Buffer.from(externalPubKey, "hex");
    // const ec = new elliptic.ec("secp256k1");
    const ec = new EC('p256');

    // 1. 直接解析，无论是 02/03/04 都能自动识别
    // const key = ec.keyFromPublic(externalPubKey, 'hex');

    // 2. 统一转为非压缩格式（04），这样后续逻辑可以完全一致
    // externalPubKey = key.getPublic().encode('hex', false);
    // console.log('Normalized externalPubKey:', externalPubKey);

    // 从私钥生成密钥对
    keyPair = ec.keyFromPrivate(privateKey);
    // const publicKey = keyPair.getPublic('hex');

    // 从外部公钥生成公钥对象
    pubKeyObj = ec.keyFromPublic(externalPubKey, 'hex');

    // // 验证公钥是否合法
    const isValidPoint = ec.curve.validate(pubKeyObj.getPublic());
    if (!isValidPoint) {
      throw new Error('Invalid public key point111');
    }

    const _externalPubKey = ec.keyFromPublic(Buffer.from(externalPubKey, 'hex'));

    // 3. 使用私钥和外部公钥生成共享密钥
    // sharedKey = keyPair.derive(pubKeyObj.getPublic(true)).toString(16);
    const sharedKey = ec.keyFromPrivate(privateKey).derive(_externalPubKey.getPublic());
    sharedSecret = ec.hash().update(sharedKey.toArray()).digest('hex'); // 确保返回十六进制字符串
    // console.log('Shared Key (Raw):', sharedSecret);
    // console.log('sharedSecret (Hex):', sharedSecret);

    // console.log(" pub: ",  keyPair.getPublic().encode("hex", false));
  } catch (error) {
    console.error('Error:', error);
  }

  return {
    externalPubKey,
    sharedSecret: sharedSecret,
    // ecdhPubKey: pubKeyObj.getPublic().encode("hex", false).toString('hex'),
    ecdhPubKey: keyPair.getPublic().encode('hex', false).toString('hex'),
    creatorPubkey: wallet.getPublicKey().toString('hex'),
  };
}
