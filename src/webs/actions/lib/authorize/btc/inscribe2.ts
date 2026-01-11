import { getBtcUtxos } from '@/queries/utxos'
import { getCurrentWallet } from "@/lib/wallet";
import { broadcastBTCTx } from '@/queries/transaction'
import { Chain, ScriptType, SignType, Transaction } from '@metalet/utxo-wallet-service'
import { getMetaIdPinUnspentOutputsObj, setMetaIdPinUnspentOutputsObj } from '@/lib/metaIdPin'

export type PrevOutput = {
  txId: string
  vOut: number
  amount: number
  address: string
}

export type Operation = 'init' | 'create' | 'modify' | 'revoke'

export type MetaidData = {
  body?: string
  operation: Operation
  path?: string
  contentType?: string
  encryption?: '0' | '1' | '2'
  version?: string
  encoding?: BufferEncoding
  revealAddr: string
  flag?: 'metaid',
  outputs?:{
    address: string
    value: number
  }[]
}

export type InscriptionRequest = {
  commitTxPrevOutputList: PrevOutput[]
  feeRate: number
  metaidDataList: MetaidData[]
  revealOutValue: number
  changeAddress: string
  minChangeValue?: number
  shareData?: string
  masterPublicKey?: string
  chainCode?: string
  commitTx?: string
  signatureList?: string[]
  /* deprecated */
  service?: {
    address: string
    satoshis: string
  }
  outputs?: {
    address: string
    satoshis: string
  }[]
}

function initOptions() {
  return { noBroadcast: false }
}

interface InscribeHexResult {
  commitTxHex: string
  revealTxsHex: string[]
  commitCost: number
  revealCost: number
  totalCost: number
}

interface InscribeTxIdResult {
  commitTxId: string
  revealTxIds: string[]
  commitCost: number
  revealCost: number
  totalCost: number
}

export async function process({
  data: { metaidDataList, service, feeRate, outputs },
  options = initOptions(),
}: {
  data: Omit<InscriptionRequest, 'commitTxPrevOutputList'>
  options?: { noBroadcast: boolean }
}): Promise<InscribeHexResult | InscribeTxIdResult> {
  const wallet = await getCurrentWallet(Chain.BTC)
  const address = wallet.getAddress()
  const utxos = await getBtcUtxos(address, wallet.getScriptType() === ScriptType.P2PKH, true)
  const { commitTx, revealTxs } = wallet.signTx(SignType.INSCRIBE_METAIDPIN, {
    utxos,
    feeRate,
    metaidDataList,
    service,
    outputs,
  })
  const commitCost = Number(commitTx.fee)
  const revealCost = revealTxs.reduce((total, revealTx) => total + Number(revealTx.fee), 0)
  const totalCost = commitCost + revealCost + Number(service?.satoshis || 0)

  if (!options.noBroadcast) {
    const commitTxId = await broadcastBTCTx(commitTx.rawTx)
    const [...revealTxIds] = await Promise.all([...revealTxs.map((revealTx) => broadcastBTCTx(revealTx.rawTx))])
    const wallet = await getCurrentWallet(Chain.BTC)
    const address = wallet.getAddress()
    const metaIdPinUnspentOutputsObj = await getMetaIdPinUnspentOutputsObj()
    const metaIdPinUnspentOutputs = metaIdPinUnspentOutputsObj[address] || []
    metaIdPinUnspentOutputs.push(`${commitTxId}:${Transaction.fromHex(commitTx.rawTx).outs.length - 1}`)
    await setMetaIdPinUnspentOutputsObj({
      ...metaIdPinUnspentOutputsObj,
      [address]: metaIdPinUnspentOutputs,
    })
    return { commitTxId, revealTxIds, commitCost, revealCost, totalCost }
  }

  return {
    totalCost,
    commitCost,
    revealCost,
    commitTxHex: commitTx.rawTx,
    revealTxsHex: revealTxs.map((revealTx) => revealTx.rawTx),
  }
}
