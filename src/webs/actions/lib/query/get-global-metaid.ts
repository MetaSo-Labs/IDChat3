/**
 * Get GlobalMetaId Action
 * 获取当前账户的 MVC、BTC、DOGE 地址对应的 GlobalMetaId
 * 
 * 使用本地 global-metaid 工具将不同链的地址转换为统一的 GlobalMetaId
 * 注意：由于各链使用不同的派生路径，每个地址的 GlobalMetaId 通常是不同的
 * 只有当使用相同派生路径时，GlobalMetaId 才会相同
 */

// import connector from '../connector'
// import { getCurrentWallet } from '../wallet'
import { Chain } from '@metalet/utxo-wallet-service'
// import { getDogeWallet } from './doge/wallet'
import { getDogeWallet } from '@/chat/wallet/doge/wallet'
import { getCurrentWallet } from '@/lib/wallet'
import { convertToGlobalMetaId } from '../global-metaid'
// import { convertToGlobalMetaId } from '../global-metaid'

export interface GlobalMetaidResult {
  mvc: {
    address: string
    globalMetaId: string
  }
  btc: {
    address: string
    globalMetaId: string
  }
  doge: {
    address: string
    globalMetaId: string
  }
}

export async function process(
  _: unknown, 
  { host, password }: { host: string; password: string }
): Promise<GlobalMetaidResult> {
  // 获取各链钱包和地址
  const mvcWallet = await getCurrentWallet(Chain.MVC, )
  const btcWallet = await getCurrentWallet(Chain.BTC, )
  const dogeWallet = await getDogeWallet({ password })

  const mvcAddress = mvcWallet.getAddress()
  const btcAddress = btcWallet.getAddress()
  const dogeAddress = dogeWallet.getAddress()

  // 检查连接状态
  if (!mvcAddress) {
    throw new Error('no MVC address')
  }

  // if (!connector.isConnected(mvcAddress, host)) {
    // throw new Error('not connected')
  // }

  // 分别为每个地址计算 GlobalMetaId
  // 由于各链使用不同的派生路径，公钥不同，GlobalMetaId 也会不同
  const mvcGlobalMetaId = convertToGlobalMetaId(mvcAddress)
  const btcGlobalMetaId = convertToGlobalMetaId(btcAddress)
  const dogeGlobalMetaId = convertToGlobalMetaId(dogeAddress)

  return {
    mvc: {
      address: mvcAddress,
      globalMetaId: mvcGlobalMetaId,
    },
    btc: {
      address: btcAddress,
      globalMetaId: btcGlobalMetaId,
    },
    doge: {
      address: dogeAddress,
      globalMetaId: dogeGlobalMetaId,
    },
  }
}
