
import { unlockP2PKHInput } from "@/lib/crypto"

export interface UnlockP2PKHInputParams {
  transaction: {
    txComposer: string
    toSignInputs: number[]
  }[]
}

export async function process(params: UnlockP2PKHInputParams) {
  const payedTransactions = await unlockP2PKHInput(params)

  return payedTransactions
}
