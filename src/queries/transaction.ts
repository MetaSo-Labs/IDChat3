import { metaletApiV3, metaletApiV4 } from "./request";
import { PageResult } from "./types/base";
import { getNetwork } from "@/lib/network";
import { useQuery } from "@tanstack/react-query";
import { Chain } from "@metalet/utxo-wallet-service";
import { FEEB } from "@/lib/config";

export const fetchBtcTxHex = async (txId: string): Promise<string> => {
  return metaletApiV3<{ rawTx: string }>(`/tx/raw`)
    .get({ net: getNetwork(Chain.BTC), txId, chain: "btc" })
    .then((res) => res.rawTx);
};

export const broadcastBTCTx = async (rawTx: string) => {
  return await metaletApiV3<string>(`/tx/broadcast`).post({
    chain: "btc",
    net: getNetwork(Chain.BTC),
    rawTx,
  });
};

export interface FeeRate {
  title: string;
  desc: string;
  feeRate: number;
}

export const getBTCTRate = async (): Promise<PageResult<FeeRate>> => {
  return metaletApiV3<PageResult<FeeRate>>(`/btc/fee/summary`).get({
    net: getNetwork(Chain.BTC),
  });
};


export const getMVCTRate = async (): Promise<PageResult<FeeRate>> => {
  const net = getNetwork(Chain.BTC)
  return metaletApiV4<PageResult<FeeRate>>(`/mvc/fee/summary`).get({ net })
}
export const getDefaultMVCTRate = async (): Promise<number> => {
  try {
    const feeRes = await getMVCTRate()
    if (feeRes.list.length) {
      const fastRate = feeRes.list.find((rate) => rate.title === 'Fast')
      // console.log('Using default MVC fee rate 1111费率:', fastRate)
      return fastRate ? fastRate.feeRate : FEEB // Return fast rate or default fee
    }
  } catch (error) {
    console.error('Error fetching MVC fee rate:', error)
  }
  
  // console.log('Using default MVC fee rate 费率:', FEEB)
  return FEEB // Default fee rate in case of error
}
export const useBTCRateQuery = (options?: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["BTCTRate"],
    queryFn: () => getBTCTRate(),
    refetchInterval: 30000,
    select: (result) => result.list,
    ...options,
  });
};
