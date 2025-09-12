import Decimal from "decimal.js";
import { getNetwork } from "@/lib/network";
import { UNISAT_ENABLED } from "@/lib/config";
import { Chain } from "@metalet/utxo-wallet-service";
import { metaletApiV3, metaletApiV4, unisatApi } from "./request";
import { Balance, BitcoinBalance, BTCBalance, MVCBalance } from "./types/balance";
import { getWalletNetwork } from "@/utils/WalletUtils";

export const fetchSpaceBalance = async (address: string): Promise<Balance> => {
  // const balance = await mvcApi<Omit<Balance, "total">>(
  //   `/address/${address}/balance`
  // ).get();
  const net = await getWalletNetwork  ()
  const balance = await metaletApiV4<MVCBalance>('/mvc/address/balance-info', { withCredential: false }).get({
    net,
    address,
  })
  return {
    confirmed: balance.confirmed,
    unconfirmed: balance.unconfirmed,
    total: new Decimal(balance.confirmed).add(balance.unconfirmed).toNumber(),
  };
};

export const fetchBtcBalance = async (address: string): Promise<Balance> => {
  const net = getNetwork();
  if (UNISAT_ENABLED) {
    const data = await unisatApi<BitcoinBalance>(`/address/balance`).get({
      net,
      address,
    });
    return {
      total: new Decimal(data.amount).mul(1e8).toNumber(),
      confirmed: new Decimal(data.confirm_amount).mul(1e8).toNumber(),
      unconfirmed: new Decimal(data.pending_amount).mul(1e8).toNumber(),
    };
  }
  const data = await metaletApiV3<BTCBalance>(`/address/btc-balance`).get({
    net,
    address,
  });

  return {
    total: new Decimal(data.balance || 0).mul(1e8).toNumber(),
    confirmed: new Decimal(data.safeBalance || 0).mul(1e8).toNumber(),
    unconfirmed: new Decimal(data.pendingBalance || 0).mul(1e8).toNumber(),
  };
};

export const doNothing = async (): Promise<Balance> => {
  return {
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  };
};

export async function getBalance(chain: Chain, address: string) {
  switch (chain) {
    case Chain.MVC:
      return fetchSpaceBalance(address);
    case Chain.BTC:
      return fetchBtcBalance(address);
    default: {
      return doNothing();
    }
  }
}
