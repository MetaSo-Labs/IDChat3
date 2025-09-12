import { TokenTransfer } from '@/queries/brc20'
import { SymbolTicker } from '@/lib/asset-symbol'
import { CoinCategory } from '@/queries/exchange-rates'
import { Balance, BRC20Balance } from '@/queries/types/balance'

export interface Asset {
  symbol: SymbolTicker
  tokenName: string
  isNative: boolean
  chain: 'btc' | 'mvc'
  queryable: boolean
  decimal: number
  balance?: Balance
  contract?: string
}

export interface BRC20Asset extends Asset {
  balance: BRC20Balance
  transferableList?: TokenTransfer[]
}

export interface FTAsset extends Asset {
  genesis: string
  codeHash: string
}

export interface RuneAsset extends Asset {
  runeId: string
  mintable: boolean
  termsAmount: string
  remainingMint: string
}

export interface MRC20Asset extends Asset {
  mrc20Id: string
  icon?: string
}

export interface Tag {
  name: string
  bg: string
  color: string
}

const tags: Tag[] = [
  {
    name: 'BTC',
    bg: '#F7931A',
    color: '#ffffff',
  },
  {
    name: 'BRC-20',
    bg: 'rgb(247, 147, 26, 0.2)',
    color: '#FF981C',
  },
  {
    name: 'MVC',
    bg: '#767EFF',
    color: '#ffffff',
  },
  {
    name: 'MetaContract',
    bg: 'rgba(153,159,255,0.2)',
    color: '#787FFF',
  },
  {
    name: 'Runes',
    bg: 'rgba(225, 194, 255, 0.3)',
    color: '#835AFF',
  },
  {
    name: 'MRC-20',
    bg: 'rgba(214, 240, 255, 0.4)',
    color: '#1472FF',
  },
]

function getTagInfo(name: string): Tag | undefined {
  return tags.find((tag) => tag.name === name)
}

function getTags(coinCategory: CoinCategory): Tag[] {
  const tagList: Tag[] = []
  const contractTag = getTagInfo(coinCategory)
  if (contractTag) {
    tagList.push(contractTag)
  }
  return tagList
}

const BTCAsset: Asset = {
  symbol: 'BTC',
  tokenName: 'BTC',
  isNative: true,
  chain: 'btc',
  queryable: true,
  decimal: 8,
}

const MVCAsset: Asset = {
  symbol: 'SPACE',
  tokenName: 'SPACE',
  isNative: true,
  chain: 'mvc',
  queryable: true,
  decimal: 8,
}

const allAssets = [BTCAsset, MVCAsset]

export { BTCAsset, MVCAsset, allAssets, getTags, getTagInfo }
