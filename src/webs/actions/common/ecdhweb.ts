import * as crypto from "crypto";
import { getBtcNetwork, getNetwork } from "@/lib/network";
import { decrypt } from "@/lib/crypto";
import { getActiveWallet } from "@/lib/wallet";
import {
  AddressType,
  BaseWallet,
  ScriptType,
} from "@metalet/utxo-wallet-service";
import { getStorageCurrentWallet } from "@/utils/WalletUtils";

export async function process(
  {
    path = "m/100'/0'/0'/0/0",
    externalPubKey,
  }: { path?: string; externalPubKey: string },
  { password }: { password: string }
) {
  // const network = getNet()
  console.log("调用ECDH：" + externalPubKey);

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

  const privateKey = wallet.getPrivateKeyBuffer();

  const _externalPubKey = Buffer.from(externalPubKey, "hex");

  // const ecdh = crypto.createECDH("prime256v1");
  const ecdh = crypto.createECDH("prime256v1");

  // @ts-ignore
  ecdh.setPrivateKey(privateKey!);
  // @ts-ignore
  const _sharedSecret = ecdh.computeSecret(_externalPubKey);

  const sharedSecret = crypto.createHash("sha256")
    .update(_sharedSecret)
    .digest();

  console.log("sharedSecret", sharedSecret.toString("hex"));

  return {
    externalPubKey,
    sharedSecret: sharedSecret.toString("hex"),
    ecdhPubKey: ecdh.getPublicKey().toString("hex"),
    creatorPubkey: wallet.getPublicKey().toString("hex"),
  };
}
