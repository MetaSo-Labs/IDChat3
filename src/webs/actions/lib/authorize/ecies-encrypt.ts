import { mvc } from "meta-contract";
import { eciesEncrypt } from "@/lib/crypto";
import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

export async function process(params: any) {
  const { message } = params;

  const wallet = await getCurrentWallet(Chain.MVC);

  const wif = wallet.getPrivateKey();
  const privateKeyObj = mvc.PrivateKey.fromWIF(wif);

  const encrypted = eciesEncrypt(message, privateKeyObj);

  return {
    status: "ok",
    result: encrypted,
  };
}
