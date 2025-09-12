import { payTransactionsWithUtxos } from "@/lib/crypto"


export async function process(params: any) {
  const toPayTransactions = params.toPayTransactions
  const utxos = params.utxos
  const signType = params.signType || 0x01
  const payedTransactions = await payTransactionsWithUtxos(toPayTransactions, utxos, signType, params.hasMetaid)
  return { payedTransactions }
} 