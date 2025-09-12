import { getCurrentWallet } from "@/lib/wallet";
import { Chain } from "@metalet/utxo-wallet-service";

export async function process() {
  try {
    return getCurrentWallet(Chain.BTC).getAddress();
  } catch (error) {
    return { error: error.message };
  }
}
