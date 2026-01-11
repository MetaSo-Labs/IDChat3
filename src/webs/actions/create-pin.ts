import { Chain } from '@metalet/utxo-wallet-service'
// import { getCurrentWallet } from '../wallet'
// import * as BtcInscribe from '../../../btc/inscribe'
// import * as DogeInscribe from './doge/inscribe'

import * as BtcInscribe from './lib/authorize/btc/inscribe2';
import * as DogeInscribe from './lib/authorize/doge/inscribe'
// import { getDogeWallet } from './doge/wallet'
import { TxComposer, mvc } from 'meta-contract'
// import { payTransactions } from '../crypto'
// import { getNetwork } from '../network'
// import { broadcastTx } from '@/queries/transaction'
import { getCurrentWallet } from '@/lib/wallet'
import { getDogeWallet } from '@/chat/wallet/doge/wallet';
import { getNetwork } from '@/lib/network';
import { payTransactions } from '@/lib/crypto';
import { broadcastTx } from '@/queries/transaction';

// 类型定义
export type Operation = 'init' | 'create' | 'modify' | 'revoke'

export type MetaidData = {
  operation: Operation
  path?: string
  body?: string | Buffer
  contentType?: string
  encryption?: '0' | '1' | '2'
  version?: string
  encoding?: BufferEncoding
  flag?: 'metaid'
  revealAddr?: string  // (BTC/DOGE) reveal 交易接收地址
}

export type Output = {
  address: string
  satoshis: string
}

export type PinOptions = {
  outputs?: Output[]
  service?: Output
  refs?: Record<string, number>
}

export type PinDetail = {
  metaidData: MetaidData
  options?: PinOptions
}

export type CreatePinParams = {
  chain: 'btc' | 'mvc' | 'doge'
  dataList: PinDetail[]
  feeRate?: number
  noBroadcast?: boolean
}

export type CreatePinResult = {
  // BTC/DOGE
  commitTxId?: string
  revealTxIds?: string[]
  commitTxHex?: string
  revealTxsHex?: string[]
  
  // MVC
  txids?: string[]
  txHexList?: string[]
  
  // 费用统计
  commitCost?: number
  revealCost?: number
  totalCost: number
}

/**
 * 替换 body 中的占位符
 */
function replaceRefs(body: string | Buffer, refs: Record<string, number>, txids: string[]): string | Buffer {
  if (Buffer.isBuffer(body)) {
    return body
  }
  
  let result = body
  for (const [placeholder, index] of Object.entries(refs)) {
    if (txids[index]) {
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), txids[index])
    }
  }
  
  return result
}

/**
 * 构建 MVC OP_RETURN
 */
function buildMvcOpReturn(metaidData: MetaidData): any[] {
  const result: any[] = ['metaid', metaidData.operation]
  
  if (metaidData.operation !== 'init') {
    result.push(metaidData.path || '')
    result.push(metaidData.encryption || '0')
    result.push(metaidData.version || '1.0.0')
    result.push(metaidData.contentType || 'text/plain;utf-8')
    
    const body = metaidData.body 
      ? Buffer.isBuffer(metaidData.body)
        ? metaidData.body
        : Buffer.from(metaidData.body, metaidData.encoding || 'utf-8')
      : undefined
    
    result.push(body)
  }
  
  return result
}

/**
 * 创建 PIN (BTC)
 */
async function createPinBtc(params: CreatePinParams): Promise<CreatePinResult> {
  const wallet = await getCurrentWallet(Chain.BTC)
  const currentAddress = wallet.getAddress()
  
  // 收集所有 service 和 outputs
  let globalService: Output | undefined
  const globalOutputs: Output[] = []
  
  for (const detail of params.dataList) {
    if (detail.options?.service && !globalService) {
      globalService = detail.options.service
    }
    if (detail.options?.outputs) {
      globalOutputs.push(...detail.options.outputs)
    }
  }
  
  // 构建 metaidDataList
  const metaidDataList: BtcInscribe.MetaidData[] = params.dataList.map(detail => ({
    ...detail.metaidData,
    body: typeof detail.metaidData.body === 'object' ? detail.metaidData.body.toString('base64') : detail.metaidData.body,
    revealAddr: detail.metaidData.revealAddr || currentAddress,
  }))
  
  // 调用 BTC inscribe
  const result = await BtcInscribe.process({
    data: {
      metaidDataList,
      service: globalService,
      outputs: globalOutputs.length > 0 ? globalOutputs.map(o => ({
        address: o.address,
        satoshis: o.satoshis,
      })) : undefined,
      feeRate: params.feeRate || 10,
      changeAddress: currentAddress,
      revealOutValue: 546,
    },
    options: { noBroadcast: params.noBroadcast || false },
  })
  
  // 处理 refs 替换
  const hasRefs = params.dataList.some(d => d.options?.refs)
  if (hasRefs && 'revealTxIds' in result) {
    // TODO: 如果需要 refs 替换，需要在构建交易时就处理
    // 目前 BTC inscribe 不支持运行时修改 body
    console.warn('BTC refs replacement is not fully supported yet')
  }
  
  return result
}

/**
 * 创建 PIN (DOGE)
 */
async function createPinDoge(params: CreatePinParams): Promise<CreatePinResult> {
  // 获取 DOGE 钱包地址作为默认 revealAddr
  const wallet = await getDogeWallet()
  const walletAddress = wallet.getAddress()
  
  // 收集所有 service
  let globalService: Output | undefined
  
  for (const detail of params.dataList) {
    if (detail.options?.service && !globalService) {
      globalService = detail.options.service
    }
  }
  
  // 构建 metaidDataList
  const metaidDataList: DogeInscribe.MetaidData[] = params.dataList.map(detail => ({
    ...detail.metaidData,
    revealAddr: detail.metaidData.revealAddr || walletAddress,  // 使用钱包地址作为默认值
  }))
  
  // 调用 DOGE inscribe
  const result = await DogeInscribe.process({
    data: {
      metaidDataList,
      service: globalService,
      feeRate: params.feeRate || 100000,
    },
    options: { noBroadcast: params.noBroadcast || false },
  })
  
  return result
}

/**
 * 创建 PIN (MVC)
 */
async function createPinMvc(params: CreatePinParams): Promise<CreatePinResult> {
  const wallet = await getCurrentWallet(Chain.MVC)
  const network = await getNetwork()
  const address = wallet.getAddress()
  
  // 第一步：构建所有交易（不签名）
  const toPayTransactions: { txComposer: string; message?: string }[] = []
  const txids: string[] = []
  
  for (let i = 0; i < params.dataList.length; i++) {
    const detail = params.dataList[i]
    const txComposer = new TxComposer()
    
    // 添加 1 satoshi 输出到自己地址
    txComposer.appendP2PKHOutput({
      address: new mvc.Address(address, network),
      satoshis: 1,
    })
    
    // 处理 refs 替换
    let metaidData = { ...detail.metaidData }
    if (detail.options?.refs && metaidData.body) {
      metaidData.body = replaceRefs(metaidData.body, detail.options.refs, txids)
    }
    
    // 添加 OP_RETURN
    const opreturn = buildMvcOpReturn(metaidData)
    txComposer.appendOpReturnOutput(opreturn)
    
    // 添加 service 输出
    if (detail.options?.service) {
      txComposer.appendP2PKHOutput({
        address: new mvc.Address(detail.options.service.address, network),
        satoshis: Number(detail.options.service.satoshis),
      })
    }
    
    // 添加额外输出
    if (detail.options?.outputs) {
      for (const output of detail.options.outputs) {
        txComposer.appendP2PKHOutput({
          address: new mvc.Address(output.address, network),
          satoshis: Number(output.satoshis),
        })
      }
    }
    
    // 记录 txid（用于后续 refs 替换）
    txids.push(txComposer.getTxId())
    
    toPayTransactions.push({
      txComposer: txComposer.serialize(),
      message: `Create PIN: ${detail.metaidData.path || 'unknown'}`,
    })
  }
  
  // 如果不广播，返回未签名的交易
  if (params.noBroadcast) {
    const payedTxs = await payTransactions(toPayTransactions, true, params.feeRate)
    
    // 计算总费用：遍历每个交易计算输入总额 - 输出总额
    let totalCost = 0
    for (const txStr of payedTxs) {
      const tx = TxComposer.deserialize(txStr)
      const mvcTx = tx.tx
      
      // 输入总额
      const inputTotal = mvcTx.inputs.reduce((sum, input) => {
        return sum + (input.output?.satoshis || 0)
      }, 0)
      
      // 输出总额
      const outputTotal = mvcTx.outputs.reduce((sum, output) => {
        return sum + output.satoshis
      }, 0)
      
      // 费用 = 输入 - 输出
      totalCost += (inputTotal - outputTotal)
    }
    
    return {
      txHexList: payedTxs.map(tx => TxComposer.deserialize(tx).getRawHex()),
      totalCost,
    }
  }
  
  // 第二步：统一 pay（添加输入、找零、签名）
  const payedTransactions = await payTransactions(toPayTransactions, true, params.feeRate)
  
  // 计算总费用
  let totalCost = 0
  for (const txStr of payedTransactions) {
    const tx = TxComposer.deserialize(txStr)
    const mvcTx = tx.tx
    
    // 输入总额
    const inputTotal = mvcTx.inputs.reduce((sum, input) => {
      return sum + (input.output?.satoshis || 0)
    }, 0)
    
    // 输出总额
    const outputTotal = mvcTx.outputs.reduce((sum, output) => {
      return sum + output.satoshis
    }, 0)
    
    // 费用 = 输入 - 输出
    totalCost += (inputTotal - outputTotal)
  }
  
  // 第三步：广播所有交易
  const broadcastedTxids: string[] = []
  for (const txStr of payedTransactions) {
    const tx = TxComposer.deserialize(txStr)
    const txid = await broadcastTx(tx.getRawHex(), Chain.MVC)
    broadcastedTxids.push(txid)
  }
  
  return {
    txids: broadcastedTxids,
    totalCost,
  }
}

/**
 * 创建 PIN 主入口
 */
export async function process(params: CreatePinParams): Promise<CreatePinResult> {
  switch (params.chain) {
    case 'btc':
      return await createPinBtc(params)
    case 'doge':
      return await createPinDoge(params)
    case 'mvc':
      return await createPinMvc(params)
    default:
      throw new Error(`Unsupported chain: ${params.chain}`)
  }
}
