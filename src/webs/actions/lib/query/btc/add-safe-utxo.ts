import { addSafeUtxo } from '@/lib/utxo'

export async function process({ address, unspentOutput }: { address: string; unspentOutput: string }) {
  await addSafeUtxo(address, unspentOutput)
  return {
    message: `Add ${unspentOutput}`,
  }
}
