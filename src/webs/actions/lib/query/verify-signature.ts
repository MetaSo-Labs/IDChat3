import { mvc } from "meta-contract";
import { verifySignature } from "@/lib/crypto";
import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

export async function process(params: any) {
  const { message, signature, encoding } = params;
  const chianWallet = await getCurrentWallet(Chain.MVC);

  const wif = chianWallet.getPrivateKey();
  const publicKey = mvc.PrivateKey.fromWIF(wif).toPublicKey();

  const verified = verifySignature(message, signature, publicKey, encoding);

  return {
    status: "ok",
    result: { verified },
  };
}
