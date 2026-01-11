/**
 * Get current DOGE wallet instance
 */

import { DogeWallet } from '@/lib/doge';
// import { getNet } from '@/lib/network'
import { getActiveWalletOnlyAccount } from '@/lib/wallet';
// import { getPassword } from '@/lib/lock'
import { decrypt } from '@/lib/crypto';
import { getNetwork } from '@/lib/network';
import { AddressType, Chain } from '@metalet/utxo-wallet-sdk';
import { isNotEmpty } from '@/utils/StringUtils';

// DOGE network type - can be livenet (mainnet) or testnet
type DogeNetworkType = 'livenet' | 'testnet';

export interface GetDogeWalletOptions {
  mnemonic?: string;
  password?: string;
  addressIndex?: number;
  addressType?: AddressType;
  coinType?: number;
}

/**
 * Get current DOGE wallet
 */
export async function getDogeWallet(options?: GetDogeWalletOptions): Promise<DogeWallet> {
  // const netValue = getNet()
  const netValue = getNetwork(Chain.BTC);
  const network: DogeNetworkType = netValue === 'livenet' ? 'livenet' : 'testnet';
  const activeWallet = await getActiveWalletOnlyAccount();

  let mnemonic = activeWallet.mnemonic;

  // const addressType = isNotEmpty(activeWallet.addressDogeType)
  //   ? activeWallet.addressDogeType
  //   : AddressType.DogeSameAsMvc;

  const addressType =
    options?.addressType ??
    (isNotEmpty(activeWallet.addressDogeType)
      ? (activeWallet.addressDogeType as AddressType)
      : AddressType.DogeSameAsMvc);

  const coinType = options?.coinType ?? activeWallet.mvcTypes;

  // let mnemonic = options?.mnemonic
  // if (!mnemonic) {
  //   const password = options?.password || (await getPassword())
  //   mnemonic = decrypt(activeWallet.mnemonic, password)
  // }

  const addressIndex = options?.addressIndex ?? activeWallet.accountsOptions[0].addressIndex;

  return new DogeWallet({
    mnemonic,
    network,
    addressIndex,
    dogeAddressType:addressType,
    coinType
  });
}

/**
 * Get current DOGE wallet
 */
// export async function getDogeWallet(options?: GetDogeWalletOptions): Promise<DogeWallet> {
//   // const netValue = getNet()
//   const netValue = getNetwork(Chain.BTC);
//   const network: DogeNetworkType = netValue === 'livenet' ? 'livenet' : 'testnet';
//   const activeWallet = await getActiveWalletOnlyAccount();
//   console.log('activeWallet', JSON.stringify(activeWallet));

//   let mnemonic = activeWallet.mnemonic;
//   // let mnemonic = options?.mnemonic
//   // if (!mnemonic) {
//   //   const password = options?.password || (await getPassword())
//   //   mnemonic = decrypt(activeWallet.mnemonic, password)
//   // }

//   const addressIndex = options?.addressIndex ?? activeWallet.accountsOptions[0].addressIndex;
//   const addressType = options?.addressType ?? (isNotEmpty(activeWallet.addressDogeType )? activeWallet.addressDogeType as AddressType : AddressType.DogeSameAsMvc);

//   const coinType = options?.coinType ?? activeWallet.mvcTypes;

//   //todo 帮我输出签名的全部参数打印
//   // console.log("coinType", coinType);
//   // console.log("addressIndex", addressIndex);
//   // console.log("addressType", addressType);

//   return new DogeWallet({
//     mnemonic,
//     network,
//     addressIndex,
//     addressType,
//     coinType,
//   });
// }
