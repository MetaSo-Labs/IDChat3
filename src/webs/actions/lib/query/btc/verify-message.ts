import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

interface verifyMessageParams {
  text: string;
  sig: string;
  publicKey: string;
  encoding?: BufferEncoding;
}

export async function process(params: verifyMessageParams) {
  const { text, sig: signature, publicKey, encoding } = params;
  const wallet = getCurrentWallet(Chain.BTC);
  return wallet.verifyMessage({ text, signature, publicKey, encoding });
}
