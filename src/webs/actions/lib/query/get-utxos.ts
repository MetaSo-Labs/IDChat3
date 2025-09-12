import { fetchUtxos } from "@/queries/utxos";
import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

export async function process() {
  const address = getCurrentWallet(Chain.MVC).getAddress();
  return fetchUtxos(Chain.MVC, address);
}
