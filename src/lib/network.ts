// FIXME: Remove bitcoinjs-lib
import { networks } from "bitcoinjs-lib";
import useNetworkStore from "@/stores/useNetworkStore";
import { Chain, Net } from "@metalet/utxo-wallet-service";

export function getNetwork(chain?: Chain) {
  const network = useNetworkStore.getState().network;
  if (!useNetworkStore.getState().network) {
    throw new Error("Network is not initialized.");
  }
  if (chain === Chain.BTC && network === "mainnet") {
    return "livenet";
  }
  return network;
}

export function getBtcNetwork() {
  const network = getNetwork();
  switch (network) {
    case "mainnet":
      return networks.bitcoin;
    case "testnet":
      return networks.testnet;
    case "regtest":
      return networks.regtest;
    default:
      throw new Error("Unknown network");
  }
}

export function setNetwork(network: Net) {
  useNetworkStore.getState().switchNetwork(network);
}
