import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

// TODO: add encoding option
export async function process(
  message: string
  // encoding?: BufferEncoding
): Promise<string> {
  const wallet = await getCurrentWallet(Chain.BTC);
  // console.log("singback: ",wallet.signMessage(message, "base64"));
  
  return wallet.signMessage(message, "base64");
}
