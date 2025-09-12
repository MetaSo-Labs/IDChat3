export interface Balance {
  total: number
  confirmed: number
  unconfirmed: number
}
export interface MVCBalance {
  address: string
  confirmed: number
  unconfirmed: number
  utxoCount: number
}


export interface BRC20Balance extends Balance {
  availableBalance: number
  transferableBalance: number
  availableBalanceSafe: number
  availableBalanceUnSafe: number
}

export interface BitcoinBalance {
  confirm_amount: string
  pending_amount: string
  amount: string
  confirm_btc_amount: string
  pending_btc_amount: string
  btc_amount: string
  confirm_inscription_amount: string
  pending_inscription_amount: string
  inscription_amount: string
  usd_value: string
}

export interface BTCBalance {
  balance: number
  block: {
    incomeFee: number
    spendFee: number
  }
  mempool: {
    incomeFee: number
    spendFee: number
  }
  pendingBalance: number
  safeBalance: number
  runesBalance: number
  inscriptionsBalance: number
}
