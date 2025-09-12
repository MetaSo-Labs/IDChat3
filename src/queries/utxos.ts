import { getNetwork } from "@/lib/network";
import { fetchBtcTxHex } from "./transaction";
import { Chain } from "@metalet/utxo-wallet-service";
import { getWalletNetwork } from "@/utils/WalletUtils";
import {  mempoolApi, metaletApiV3, metaletApiV4 } from "./request";
import { getSafeUtxos } from "@/lib/utxo";

export interface UTXO {
  txId: string;
  outputIndex: number;
  satoshis: number;
  confirmed: boolean;
  rawTx?: string;
  inscriptions?:
    | {
        id: string;
        num: number;
      }[]
    | null;
}

export type MvcUtxo = {
  flag: string;
  address: string;
  txid: string;
  outIndex: number;
  value: number;
  height: number;
};

export interface MRC20UTXO extends UTXO {
  chain: Chain
  address: string
  scriptPk: string
  timestamp: number
  mrc20s: MRC20Info[]
  blockHeight: number
}

interface MRC20Info {
  tick: string
  mrc20Id: string
  txPoint: string
  amount: string
  balance: string
  decimals: string
  tokenName: string
}

export interface MetaIDPin {
  id: string
  pop: string
  popLv: number
  number: number
  rootTxId: string
  address: string
  output: string
  outputValue: number
  timestamp: number
  genesisFee: number
  genesisHeight: number
  genesisTransaction: string
  txInIndex: number
  txInOffset: number
  operation: string
  path: string
  parentPath: string
  encryption: string
  version: string
  preview: string
  content: string
  contentType: string
  contentBody: string
  contentLength: number
  contentSummary: string
  contentTypeDetect: string
  status: number
  rawTx?: string
}



// TODO: fix network switch
// const fetchMVCUtxos = async (address: string): Promise<MvcUtxo[]> => {
//   return (await mvcApi<MvcUtxo[]>(`/address/${address}/utxo`)).get();
// };

// const fetchMVCUtxos = async (address: string, useUnconfirmed = true): Promise<MvcUtxo[]> => {
//   const net = getNetwork()
//   let allUtxos: MvcUtxo[] = []
//   let flag
//   let hasMore = true

//   while (hasMore) {
//     const { list = [] } = await metaletApiV4<{ list: MvcUtxo[] }>('/mvc/address/utxo-list').get({
//       address,
//       net,
//       flag,
//     })
//     flag = list[list.length - 1]?.flag
//     let filteredList = list.filter((utxo) => utxo.value >= 600)
//     // if (!useUnconfirmed) {
//     //   filteredList = filteredList.filter((utxo) => utxo.height > 0)
//     // }

//     allUtxos = [...allUtxos, ...filteredList]
//     hasMore = list.length > 0
//   }

//   return allUtxos
// }

const fetchMVCUtxos = async (address: string, useUnconfirmed = true): Promise<MvcUtxo[]> => {
  // const net = getNet()
  const net = getNetwork()
  let allUtxos: MvcUtxo[] = []
  let flag: string | undefined
  let hasMore = true
  const { list = [] } = await metaletApiV4<{ list: MvcUtxo[] }>('/mvc/address/utxo-list').get({
    address,
    net,
    flag,
  })

  // console.log("utxo 结果："+JSON.stringify(list));
  

  while (hasMore) {
    try {
      const { list = [] } = await metaletApiV4<{ list: MvcUtxo[] }>('/mvc/address/utxo-list').get({
        address,
        net,
        flag,
      })


      if (list.length === 0) {
        hasMore = false
        break
      }

      flag = list[list.length - 1]?.flag
      const filteredList = list.filter((utxo) => utxo.value >= 600 && (useUnconfirmed || utxo.height > 0))
      allUtxos = [...allUtxos, ...filteredList]
    } catch (error) {
      console.error('Error fetching UTXOs:', error)
      hasMore = false
    }
  }

  // console.log('allUtxos 返回数据：', JSON.stringify(allUtxos));
  
  return allUtxos
}


export type Utxo = {
  addressType: number;
  outputIndex: number;
  satoshis: number;
  satoshi: number;
  txid: string;
  txId: string;
  vout: number;
};

export const fetchUtxos = async (
  chain: Chain,
  address: string
): Promise<any[]> => {
  if (chain === Chain.MVC) {
    return (await fetchMVCUtxos(address)) || [];
  } else {
    const needRawTx = true;
    return (await getBtcUtxos(address, needRawTx)) || [];
    // return (await getBtcUtxos(address)) || [];
  }
};

export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
  M44_P2WPKH,
  M44_P2TR,
}

export interface UnisatUTXO {
  txid: string;
  vout: number;
  satoshis: number;
  scriptPk: string;
  addressType: AddressType;
  inscriptions: {
    inscriptionId: string;
    inscriptionNumber?: number;
    offset: number;
  }[];
  atomicals: {
    atomicalId: string;
    atomicalNumber: number;
    type: "NFT" | "FT";
    ticker?: string;
  }[];

  runes: {
    runeid: string;
    rune: string;
    amount: string;
  }[];
}

export async function getBtcUtxos(
  address: string,
  needRawTx = false,
  useUnconfirmed = true
): Promise<UTXO[]> {
  // const net = getNet();
  // if (UNISAT_ENABLED) {
  //   const unisatUtxos = await unisatApi<UnisatUTXO[]>(`/address/btc-utxo`).get({ net, address })
  //   const utxos = unisatUtxos.map((utxo) => formatUnisatUTXO(utxo))
  //   utxos.sort((a, b) => {
  //     if (a.confirmed !== b.confirmed) {
  //       return b.confirmed ? 1 : -1
  //     }
  //     return a.satoshis - b.satoshis
  //   })

  //   return utxos.filter((utxo) => utxo.confirmed)
  // }
  const network = await getWalletNetwork(Chain.BTC);

  let utxos =
    (await metaletApiV3<UTXO[]>("/address/btc-utxo").get({
      net: network,
      address,
      unconfirmed: "1",
    })) || [];

    if (!useUnconfirmed) {
      utxos = utxos.filter((utxo) => utxo.confirmed)
    } else {
      // utxos = await getSafeUtxos(address, utxos)
    }
  if (needRawTx) {
    for (let utxo of utxos) {
      utxo.rawTx = await fetchBtcTxHex(utxo.txId);
    }
  }
  return utxos.sort((a, b) => {
    if (a.confirmed !== b.confirmed) {
      return b.confirmed ? 1 : -1;
    }
    return a.satoshis - b.satoshis;
  });
}

export async function getMetaPin(pinId: string, needRawTx: boolean = false): Promise<MetaIDPin> {
  // const net = getNet()
  const net = await getWalletNetwork(Chain.BTC);

  const metaIdPin = await metaletApiV3<MetaIDPin>('/pin/utxo').get({
    net,
    pinId,
  })
  console.log('metaIdPin', metaIdPin);
  
  if (needRawTx) {
    const txId = metaIdPin.output.split(':')[0]
    metaIdPin.rawTx = await fetchBtcTxHex(txId)
  }
  return metaIdPin
}


export async function getMRC20Utxos(address: string, tickId: string, needRawTx = false) {
  const network = await getWalletNetwork(Chain.BTC);
    // console.log("getMRC20Utxos", network, address, tickId, needRawTx);

  const { list: mrc20Utxos } = await metaletApiV3<{
    total: number
    list: MRC20UTXO[]
  }>(`/mrc20/address/utxo`).get({
    net: network,
    address,
    tickId,
  })

  if (needRawTx) {
    for (let utxo of mrc20Utxos) {
      utxo.rawTx = await fetchBtcTxHex(utxo.txId)
    }
  }
  return mrc20Utxos;
}


export async function getRuneUtxos(
  address: string,
  runeId: string,
  needRawTx = false
): Promise<UTXO[]> {
  // const net = getNet();
  const res = await metaletApiV3<{
    total: number;
    cursor: number;
    list: UTXO[];
  }>("/runes/address/utxo").get({
    net: getNetwork(Chain.BTC),
    address,
    runeId,
  });
  if (needRawTx) {
    for (let utxo of res.list) {
      utxo.rawTx = await fetchBtcTxHex(utxo.txId);
      utxo.rawTx;
    }
  }

  return res.list;
}

// export async function getInscriptionUtxos(inscriptions: Inscription[]): Promise<UTXO[]> {
//   const unisatUtxos = await unisatApi<UnisatUTXO[]>('/inscription/utxos').post({
//     inscriptionIds: inscriptions.map((inscription) => inscription.inscriptionId),
//   })
//   const utxos = unisatUtxos.map((utxo) => {
//     const inscriptionIds = utxo.inscriptions.map((inscription) => inscription.id)
//     const inscription = inscriptions.find((inscription) => inscriptionIds.includes(inscription.inscriptionId))!
//     return { ...utxo, confirmed: !!inscription.utxoConfirmation }
//   })
//   return utxos.map((utxo) => formatUnisatUTXO(utxo))
// }

export async function getInscriptionUtxo(
  inscriptionId: string,
  needRawTx: boolean = false
): Promise<UTXO> {
  const net = getNetwork(Chain.BTC);
  const utxo = await metaletApiV3<UTXO>("/inscription/utxo").get({
    net,
    inscriptionId,
  });
  if (needRawTx) {
    utxo.rawTx = await fetchBtcTxHex(utxo.txId);
  }
  return utxo;
}

export interface MempoolUtxo {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
}

function formatMempoolUTXO(utxo: MempoolUtxo): UTXO {
  return {
    txId: utxo.txid,
    outputIndex: utxo.vout,
    satoshis: utxo.value,
    confirmed: utxo.status.confirmed,
    inscriptions: [],
  };
}

function formatUnisatUTXO(utxo: UnisatUTXO): UTXO {
  return {
    txId: utxo.txid,
    outputIndex: utxo.vout,
    satoshis: utxo.satoshis,
    confirmed: true,
    inscriptions: [],
  };
}

export async function getUtxos(address: string): Promise<UTXO[]> {
  const utxos = await mempoolApi<MempoolUtxo[]>(
    `/address/${address}/utxo`
  ).get();
  return utxos.map((utxo) => formatMempoolUTXO(utxo));
}
