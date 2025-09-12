// import useStorage from './storage'
import { UTXO } from '@/queries/utxos'
import { createStorage } from '@/utils/AsyncStorageUtil'

const storage = createStorage();

const SAFE_UTXO_LIST = 'SAFE_UTXO_LIST'

const getSafeUnspentOutputsObj = async () => {
  return await storage.get<{ [address: string]: string[] }>(SAFE_UTXO_LIST, {
    defaultValue: {},
  })
}

const setSafeUnspentOutputsObj = async (safeUnspentOutputsObj: { [address: string]: string[] }) => {
  await storage.set(SAFE_UTXO_LIST, safeUnspentOutputsObj)
}

export const getSafeUtxos = async (address: string, utxos: UTXO[]) => {
  const safeUnspentOutputsObj = await getSafeUnspentOutputsObj()
  // const btcUnspentOutputs = utxos.map((utxo) => `${utxo.txId}:${utxo.outputIndex}`)
  let safeUnspentOutputs = safeUnspentOutputsObj[address] || []
  // safeUnspentOutputs = safeUnspentOutputs.filter((unspentOutputs) => btcUnspentOutputs.includes(unspentOutputs))
  // safeUnspentOutputsObj[address] = safeUnspentOutputs
  // await setSafeUnspentOutputsObj(safeUnspentOutputsObj)
  return utxos.filter((utxo) => utxo.confirmed || safeUnspentOutputs.includes(`${utxo.txId}:${utxo.outputIndex}`))
}

export const addSafeUtxo = async (address: string, unspentOutput: string) => {
  console.log("addSafeUtxo", address, unspentOutput);
  
  const safeUnspentOutputsObj = await getSafeUnspentOutputsObj()
  const safeUnspentOutputs = safeUnspentOutputsObj[address] || []
  safeUnspentOutputs.push(unspentOutput)
  safeUnspentOutputsObj[address] = safeUnspentOutputs
  await setSafeUnspentOutputsObj(safeUnspentOutputsObj)
}
