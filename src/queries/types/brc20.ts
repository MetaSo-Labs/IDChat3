export interface TokenInfo {
    totalSupply: string
    totalMinted: string
  }
  
  export interface TokenBalance {
    availableBalance: string
    overallBalance: string
    ticker: string
    transferableBalance: string
    availableBalanceSafe: string
    availableBalanceUnSafe: string
  }
  
  export interface TokenTransfer {
    ticker: string
    amount: string
    inscriptionId: string
    inscriptionNumber: number
    timestamp: number
  }
  
  export interface AddressTokenSummary {
    tokenInfo: TokenInfo
    tokenBalance: TokenBalance
    historyList: TokenTransfer[]
    transferableList: TokenTransfer[]
  }