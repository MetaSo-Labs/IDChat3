/**
 * Get DOGE Balance Action
 */

import { getDogeWallet } from "@/chat/wallet/doge/wallet"
import { fetchDogeBalance } from "../../../../../queries/doge/balance"


export async function process(
  _: unknown, 
  { password }: { password: string }
) {
  const wallet = await getDogeWallet({ password })
  const address = wallet.getAddress()
  return await fetchDogeBalance(address)
}
