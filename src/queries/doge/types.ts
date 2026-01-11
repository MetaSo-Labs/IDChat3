/**
 * DOGE Balance Types
 */

import Decimal from 'decimal.js'

export interface DogeBalance {
  address: string
  confirmed: number
  unconfirmed: number
  utxoCount: number
}

export interface DogeBalanceResult {
  total: Decimal
  confirmed: Decimal
  unconfirmed: Decimal
}
