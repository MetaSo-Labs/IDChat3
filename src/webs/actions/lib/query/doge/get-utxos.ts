/**
 * Get DOGE UTXOs Action
 */

import { getDogeWallet } from "@/chat/wallet/doge/wallet"
import { fetchDogeUtxos } from "../../../../../queries/doge/utxos"


export async function process(
  {
    needRawTx = false,
  }: {
    needRawTx?: boolean
  },
  { password }: { password: string }
) {
  const wallet = await getDogeWallet({ password })
  const address = wallet.getAddress()
  return await fetchDogeUtxos(address, needRawTx)
}
