// import { getCurrentWallet } from '../../wallet'
// import { UTXO, getBtcUtxos } from '@/queries/utxos'
import { getCurrentWallet } from '@/lib/wallet'
import { UTXO, getBtcUtxos } from '@/queries/utxos'
import { Chain, ScriptType, SignType } from '@metalet/utxo-wallet-service'

export interface MRC20MintParams {
  id: string
  utxos: UTXO[]
  flag?: 'metaid' | 'testid'
  revealAddr?: string
  contentType?: string
  commitFeeRate: number
  revealFeeRate: number
  changeAddress?: string
  metaIdPinUtxos: UTXO[]
  revealOutValue?: number
  service?: {
    address: string
    satoshis: string
  }
}

export async function process(params: MRC20MintParams) {
  const wallet = await getCurrentWallet(Chain.BTC)
  const utxos = await getBtcUtxos(wallet.getAddress(), wallet.getScriptType() === ScriptType.P2PKH)

  return wallet.signTx(SignType.MRC20_MINT, {
    ...params,
    utxos,
  })
}
