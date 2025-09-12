import { fetchTokens } from "@/queries/tokens";
import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

export async function process() {
  const address = getCurrentWallet(Chain.MVC).getAddress();
  return await fetchTokens(address);
}
