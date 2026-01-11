/**
 * Get DOGE Public Key Action
 */

import { getDogeWallet } from "@/chat/wallet/doge/wallet"


export async function process(
  _: unknown, 
  { password }: { password: string }
): Promise<string> {
  const wallet = await getDogeWallet({ password })
  return wallet.getPublicKeyHex()
}
