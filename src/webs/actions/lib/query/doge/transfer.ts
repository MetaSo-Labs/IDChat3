/**
 * DOGE Transfer Action
 */

import { getDogeWallet } from '@/chat/wallet/doge/wallet'
import Decimal from 'decimal.js'
import { broadcastDogeTx, DogeFeeRate, fetchDogeUtxos, getDefaultDogeFeeRates } from '../../../../../queries/doge'

interface DogeTransferParams {
  toAddress: string
  satoshis: string | number
  options?: {
    noBroadcast?: boolean
    feeRate?: string | number
  }
}

const MIN_TRANSFER_SATOSHIS = 1000000

export async function process(
  params: DogeTransferParams
): Promise<{ txId: string } | { txHex: string }> {
  const wallet = await getDogeWallet()
  const address = wallet.getAddress()

  const transferAmount = new Decimal(params.satoshis)
  if (transferAmount.lt(MIN_TRANSFER_SATOSHIS)) {
    throw new Error(`Minimum transfer amount is 0.01 DOGE (${MIN_TRANSFER_SATOSHIS} satoshis)`)
  }

  // Get fee rate
  let feeRate = params.options?.feeRate

  if (!feeRate) {
    const rates: DogeFeeRate[] = getDefaultDogeFeeRates()
    const avgRate = rates.find((item) => item.title === 'Avg')
    feeRate = avgRate?.feeRate || 200000 // Default to 0.002 DOGE/KB
  }

  feeRate = Number(feeRate)

  // Fetch UTXOs with raw transaction data (needed for P2PKH signing)
  const utxos = await fetchDogeUtxos(address, true)

  if (!utxos.length) {
    throw new Error('No UTXOs available')
  }

  // Sign the transaction
  const { txId, rawTx, fee } = await wallet.signTransaction({
    utxos,
    outputs: [
      {
        address: params.toAddress,
        satoshis: new Decimal(params.satoshis).toNumber(),
      },
    ],
    feeRate,
    changeAddress: address,
  })

  // Return raw hex if noBroadcast is set
  if (params.options?.noBroadcast) {
    return { txHex: rawTx }
  }

  // Broadcast the transaction
  const broadcastTxId = await broadcastDogeTx(rawTx)
  
  return { txId: broadcastTxId }
}
