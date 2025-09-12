import { getCurrentWallet } from "@/lib/wallet";
import { setNetwork, getNetwork } from "@/lib/network";
import { Chain, Net } from "@metalet/utxo-wallet-service";
import { sleep } from "@/lib/helpers";

export async function process({ network }: { network?: Net }) {
  if (!network) {
    network = getNetwork() === "testnet" ? "mainnet" : "testnet";
  }
  setNetwork(network);
  const wallet = getCurrentWallet(Chain.MVC);

  const address = wallet.getAddress();

  return {
    status: "ok",
    network,
    address,
  };
}
