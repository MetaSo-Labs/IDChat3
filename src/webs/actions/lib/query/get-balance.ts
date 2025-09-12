import { getBalance } from "@/queries/balance";
import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

export async function process() {
  try {
    const address = getCurrentWallet(Chain.MVC).getAddress();
    return await getBalance(Chain.MVC, address);
  } catch (error) {
    return { error: error.message };
  }
}
