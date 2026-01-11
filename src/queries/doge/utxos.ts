/**
 * DOGE UTXO Query Functions
 */

// import { getNet } from '@/lib/network';
import { metaletApiV4 } from '@/queries/request';
import { DogeUTXO } from '@/lib/doge/wallet';
import { Chain } from '@metalet/utxo-wallet-sdk';
import { getNetwork } from '@/lib/network';

export interface DogeUtxoApiItem {
  address: string;
  txid: string;
  outIndex: number;
  value: number;
  height: number;
  flag?: string;
}

export interface DogeUtxoListResponse {
  list: DogeUtxoApiItem[];
  total: number;
}

/**
 * Fetch DOGE transaction hex for raw transaction data
 */
export async function fetchDogeTxHex(txId: string): Promise<string> {
  // const net = getNet()
  const net = getNetwork(Chain.BTC);

  const data = await metaletApiV4<{ hex: string }>('/doge/tx/raw', {
    withCredential: false,
  }).get({
    net,
    txId,
  });

  return data.hex;
}

/**
 * Fetch DOGE UTXOs for an address
 * Uses the /v4/doge/address/utxo-list endpoint
 */
export async function fetchDogeUtxos(
  address: string,
  needRawTx: boolean = false,
): Promise<DogeUTXO[]> {
  // const net = getNet();
  const net = getNetwork(Chain.BTC);
  console.log('fetchDogeUtxos', net);

  const data = await metaletApiV4<DogeUtxoListResponse>('/doge/address/utxo-list', {
    withCredential: false,
  }).get({
    net,
    address,
  });

  // console.log('data77777:', JSON.stringify(data));
  const utxos: DogeUTXO[] = data.list.map((item) => ({
    txId: item.txid,
    outputIndex: item.outIndex,
    satoshis: item.value,
    address: item.address,
    height: item.height,
    confirmed: item.height > 0,
  }));

  // Fetch raw transaction data if needed (required for signing P2PKH)
  if (needRawTx) {
    for (const utxo of utxos) {
      utxo.rawTx = await fetchDogeTxHex(utxo.txId);
    }
  }

  // Filter out dust UTXOs (less than 0.01 DOGE = 1000000 satoshis)
  return utxos.filter((utxo) => utxo.satoshis >= 1000000);
}

/**
 * Fetch all DOGE UTXOs (including small ones)
 */
export async function fetchAllDogeUtxos(address: string): Promise<DogeUTXO[]> {
  // const net = getNet();
  const net = getNetwork(Chain.BTC);

  const data = await metaletApiV4<DogeUtxoListResponse>('/doge/address/utxo-list', {
    withCredential: false,
  }).get({
    net,
    address,
  });

  return data.list.map((item) => ({
    txId: item.txid,
    outputIndex: item.outIndex,
    satoshis: item.value,
    address: item.address,
    height: item.height,
    confirmed: item.height > 0,
  }));
}
