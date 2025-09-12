// import { Ref } from 'vue'
// import Decimal from 'decimal.js'
// import { PageResult } from './types'
// import { getNet } from '@/lib/network'
// import { useQuery } from '@tanstack/vue-query'
// import { UNISAT_ENABLED } from '@/data/config'
// import { type BRC20Asset } from '@/data/assets'
import { SymbolTicker } from '@/lib/asset-symbol'
// import { metaletApiV3, unisatApi } from './request'
// import { Balance_QUERY_INTERVAL } from './constants'
// import { AddressTokenSummary, TokenBalance } from './types/brc20'

// merge btc.ts

export type Brc20 = {
  symbol: SymbolTicker
  balance: string
  availableBalance: string
  transferBalance: string
}

// interface TickerInfo {
//   completeBlocktime: number
//   completeHeight: number
//   confirmedMinted: string
//   confirmedMinted1h: string
//   confirmedMinted24h: string
//   creator: string
//   decimal: string
//   deployBlocktime: number
//   deployHeight: number
//   historyCount: number
//   holdersCount: number
//   inscriptionId: string
//   inscriptionNumber: number
//   inscriptionNumberEnd: number
//   inscriptionNumberStart: number
//   limit: string
//   max: string
//   mintTimes: number
//   minted: string
//   ticker: string
//   totalMinted: number
//   txid: string
// }

// export const getTickerInfo = async (tick: string): Promise<TickerInfo> => {
//   const net = getNet()
//   return await metaletApiV3<TickerInfo>(`/brc20/tick/info`).get({ net, tick })
// }

// export const fetchBRC20List = async (address: string): Promise<BRC20Asset[]> => {
//   const net = getNet()
//   if (UNISAT_ENABLED) {
//     return (
//       await unisatApi<PageResult<TokenBalance>>(`/brc20/list`).get({ net, address, cursor: '0', size: '100000' })
//     ).list.map(
//       (brc20) =>
//         ({
//           symbol: brc20.ticker,
//           tokenName: brc20.ticker,
//           isNative: false,
//           chain: 'btc',
//           queryable: true,
//           decimal: 0,
//           contract: 'BRC-20',
//           balance: {
//             total: new Decimal(brc20.overallBalance),
//             confirmed: new Decimal(brc20.transferableBalance).add(brc20.availableBalanceSafe),
//             unconfirmed: new Decimal(brc20.availableBalanceUnSafe),
//             availableBalance: Number(brc20.availableBalance),
//             transferableBalance: Number(brc20.transferableBalance),
//             availableBalanceSafe: Number(brc20.availableBalanceSafe),
//             availableBalanceUnSafe: Number(brc20.availableBalanceUnSafe),
//           },
//         }) as BRC20Asset
//     )
//   }
//   return (
//     await metaletApiV3<PageResult<TokenBalance>>(`/brc20/tokens`).get({ net, address, cursor: '0', size: '100000' })
//   ).list.map(
//     (brc20) =>
//       ({
//         symbol: brc20.ticker,
//         tokenName: brc20.ticker,
//         isNative: false,
//         chain: 'btc',
//         queryable: true,
//         decimal: 0,
//         contract: 'BRC-20',
//         balance: {
//           total: new Decimal(brc20.overallBalance),
//           confirmed: new Decimal(brc20.transferableBalance).add(brc20.availableBalanceSafe),
//           unconfirmed: new Decimal(brc20.availableBalanceUnSafe),
//           availableBalance: Number(brc20.availableBalance),
//           transferableBalance: Number(brc20.transferableBalance),
//           availableBalanceSafe: Number(brc20.availableBalanceSafe),
//           availableBalanceUnSafe: Number(brc20.availableBalanceUnSafe),
//         },
//       }) as BRC20Asset
//   )
// }

// export async function fetchBRC20Detail(address: string, symbol: string): Promise<BRC20Asset> {
//   const net = getNet()
//   if (UNISAT_ENABLED) {
//     const brc20Detail = await unisatApi<AddressTokenSummary>('/brc20/token-summary').get({
//       net,
//       address,
//       ticker: encodeURIComponent(symbol),
//     })
//     return {
//       symbol,
//       tokenName: symbol,
//       isNative: false,
//       chain: 'btc',
//       queryable: true,
//       decimal: 0,
//       transferableList: brc20Detail.transferableList,
//       balance: {
//         confirmed: new Decimal(brc20Detail.tokenBalance.availableBalanceSafe).add(
//           brc20Detail.tokenBalance.transferableBalance
//         ),
//         unconfirmed: new Decimal(brc20Detail.tokenBalance.availableBalanceUnSafe),
//         total: new Decimal(brc20Detail.tokenBalance.availableBalance).add(brc20Detail.tokenBalance.transferableBalance),
//         availableBalance: Number(brc20Detail.tokenBalance.availableBalance),
//         availableBalanceSafe: Number(brc20Detail.tokenBalance.availableBalanceSafe),
//         availableBalanceUnSafe: Number(brc20Detail.tokenBalance.availableBalanceUnSafe),
//         transferableBalance: Number(brc20Detail.tokenBalance.transferableBalance),
//       },
//       contract: 'BRC-20',
//     } as BRC20Asset
//   }
//   const brc20Detail = await metaletApiV3<AddressTokenSummary>('/brc20/token-summary').get({
//     net,
//     address,
//     ticker: encodeURIComponent(symbol),
//   })
//   return {
//     symbol,
//     tokenName: symbol,
//     isNative: false,
//     chain: 'btc',
//     queryable: true,
//     decimal: 0,
//     transferableList: brc20Detail.transferableList,
//     balance: {
//       confirmed: new Decimal(brc20Detail.tokenBalance.availableBalanceSafe).add(
//         brc20Detail.tokenBalance.transferableBalance
//       ),
//       unconfirmed: new Decimal(brc20Detail.tokenBalance.availableBalanceUnSafe),
//       total: new Decimal(brc20Detail.tokenBalance.availableBalance).add(brc20Detail.tokenBalance.transferableBalance),
//       availableBalance: Number(brc20Detail.tokenBalance.availableBalance),
//       availableBalanceSafe: Number(brc20Detail.tokenBalance.availableBalanceSafe),
//       availableBalanceUnSafe: Number(brc20Detail.tokenBalance.availableBalanceUnSafe),
//       transferableBalance: Number(brc20Detail.tokenBalance.transferableBalance),
//     },
//     contract: 'BRC-20',
//   } as BRC20Asset
// }

// export const useBRC20AssetQuery = (address: Ref<string>, ticker: Ref<string>, options: { enabled: Ref<boolean> }) => {
//   return useQuery({
//     queryKey: ['BRCTicker', { address, ticker }],
//     queryFn: () => fetchBRC20Detail(address.value, ticker.value),
//     ...options,
//   })
// }

// export interface TokenInfo {
//   totalSupply: string
//   totalMinted: string
// }

export interface TokenTransfer {
  ticker: string
  amount: string
  inscriptionId: string
  inscriptionNumber: number
  timestamp: number
}

// export const useBRC20AssetsQuery = (address: Ref<string>, options: { enabled: Ref<boolean> }) => {
//   return useQuery({
//     queryKey: ['BRC20Assets', { address }],
//     queryFn: () => fetchBRC20List(address.value),
//     refetchInterval: Balance_QUERY_INTERVAL,
//     ...options,
//   })
// }
