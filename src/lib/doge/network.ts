/**
 * Dogecoin Network Configuration
 * 
 * DOGE uses similar structure to Bitcoin but with different parameters
 * BIP44 coin type for DOGE is 3
 */

import { Network } from 'bitcoinjs-lib'

// Dogecoin mainnet network parameters
export const dogeMainnet: Network = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'doge', // DOGE doesn't really use bech32, but required by type
  bip32: {
    public: 0x02facafd,  // dgub
    private: 0x02fac398, // dgpv
  },
  pubKeyHash: 0x1e,      // Address prefix: D
  scriptHash: 0x16,      // Script hash prefix: 9 or A
  wif: 0x9e,             // WIF prefix
}

// Dogecoin testnet network parameters
export const dogeTestnet: Network = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'tdge',
  bip32: {
    public: 0x0432a9a8,  // tgub
    private: 0x0432a243, // tgpv
  },
  pubKeyHash: 0x71,      // Address prefix: n
  scriptHash: 0xc4,      // Script hash prefix
  wif: 0xf1,             // WIF prefix
}

// Get DOGE network based on current network setting
export function getDogeNetwork(network: 'mainnet' | 'testnet' | 'regtest' | 'livenet'): Network {
  return (network === 'mainnet' || network === 'livenet') ? dogeMainnet : dogeTestnet
}

// DOGE BIP44 coin type
export const DOGE_COIN_TYPE = 3

// Default derivation path for DOGE (Legacy P2PKH only, as DOGE doesn't support SegWit)
export const DOGE_DEFAULT_PATH = "m/44'/3'/0'/0/0"

// Get DOGE derivation path for a given address index
export function getDogeDerivationPath(addressIndex: number = 0): string {
  return `m/44'/${DOGE_COIN_TYPE}'/0'/0/${addressIndex}`
}
