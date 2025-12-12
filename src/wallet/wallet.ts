import {
  AddressType,
  CoinType,
  SignType,
  Transaction,
  getAddressFromScript,
} from '@metalet/utxo-wallet-service';
import { WalletBean } from '../bean/WalletBean';
import {
  wallet_password_key,
  wallets_key,
  walllet_address_type_key,
} from '../utils/AsyncStorageUtil';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import {
  getCurrentWalletSeed,
  getStorageCurrentWallet,
  getStorageWallets,
  getWalletNetwork,
  isNoStorageWallet,
} from '../utils/WalletUtils';
import { BtcWallet, MvcWallet, ScriptType } from '@metalet/utxo-wallet-service';
import * as bip39 from '@scure/bip39';
import { wordlist } from "@scure/bip39/wordlists/english";
import { getRandomColorList } from '../utils/MetaFunUiils';
import { getBtcUtxos } from '@/queries/utxos';
import { addSafeUtxo } from '@/lib/utxo';
import { BtcHotWallet } from '@metalet/utxo-wallet-sdk';
import useWalletStore from '@/stores/useWalletStore';

// READY
export const btc_network = 'mainnet';
export const btc_network_test = 'testnet';
export const net_network = 'livenet';

// export const btc_network = "testnet";
// export const net_network = "testnet";

/**
 * 获取当前选中的mvc钱包
 */
export async function getCurrentMvcWallet(): Promise<MvcWallet> {
  const wallet = await getStorageCurrentWallet();

  const seed = await getCurrentWalletSeed();
  const network = await getWalletNetwork();

  const mvcWallet = new MvcWallet({
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
    mnemonic: wallet.mnemonic,
    addressIndex: wallet.isCurrentPathIndex,
    addressType: AddressType.LegacyMvc,
    coinType: wallet.mvcTypes,
    seed: seed,
  });
  return mvcWallet;
}

export async function getCurrentBtcWallet(): Promise<BtcWallet> {
  const wallet = await getStorageCurrentWallet();
  const addressType = wallet.addressType;
  const seed = await getCurrentWalletSeed();
  const network = await getWalletNetwork();

  let coinType = addressType === AddressType.SameAsMvc ? wallet.mvcTypes : CoinType.BTC;

  const btcWallet = new BtcWallet({
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
    mnemonic: wallet.mnemonic,
    addressIndex: wallet.isCurrentPathIndex,
    addressType: addressType,
    coinType: coinType,
    seed,
    //   coinType: wallet.mvcTypes,
  });
  return btcWallet;
}

export async function getBtcWallet(uAddressType: AddressType): Promise<BtcWallet> {
  // console.log("getBtcWallet调用： "+uAddressType);

  const wallet = await getStorageCurrentWallet();
  const seed = await getCurrentWalletSeed();
  const network = await getWalletNetwork();

  let coinType = uAddressType === AddressType.SameAsMvc ? wallet.mvcTypes : CoinType.BTC;

  const btcWallet = new BtcWallet({
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
    mnemonic: wallet.mnemonic,
    addressIndex: wallet.isCurrentPathIndex,
    addressType: uAddressType,
    coinType: coinType,
    seed,
    //   coinType: wallet.mvcTypes,
  });
  return btcWallet;
}

export async function getBtCreateWallet(walletBean: WalletBean): Promise<BtcWallet> {
  // const wallet = await getStorageCurrentWallet();
  // let coinType = CoinType.BTC;
  let coinType = CoinType.MVC;
  const network = await getWalletNetwork();

  const btcWallet = new BtcWallet({
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
    mnemonic: walletBean.mnemonic,
    addressIndex: walletBean.isCurrentPathIndex,
    addressType: walletBean.addressType,
    coinType: coinType,
    // seed
    //   coinType: wallet.mvcTypes,
  });
  return btcWallet;
}

export async function getMvcCreateWallet(walletBean: WalletBean, seed?): Promise<BtcWallet> {
  const network = await getWalletNetwork();
  const mvcWallet = new MvcWallet({
    network: network === 'mainnet' ? 'mainnet' : 'testnet',
    mnemonic: walletBean.mnemonic,
    addressIndex: walletBean.isCurrentPathIndex,
    addressType: AddressType.LegacyMvc,
    coinType: walletBean.mvcTypes,
    seed: seed,
  });
  return mvcWallet;
}

export async function getMvcRootPath(): Promise<string> {
  const mvcWallet = await getCurrentMvcWallet();
  const mvcFullPath = mvcWallet.getPath();

  return mvcFullPath.slice(0, mvcFullPath.length - 4);
}
///////////////function//////////////////////////
export async function createMetaletWallet(
  mvcPath,
  walletMode: string,
): Promise<{
  btcWallet: BtcWallet;
  mvcWallet: MvcWallet;
  walletBean: WalletBean;
}> {
    console.log('createWallet 0000:');
    console.log('createWallet 0000:'+wordlist);

  const mnemonic = bip39.generateMnemonic(wordlist);

  console.log(mnemonic);

  //wallet
  let walletName;
  let walletID = Math.random().toString(36).substr(2, 8);
  let wallet_addressType = AddressType.SameAsMvc;
  //account
  let accountName = 'Account 1';
  let accountID = Math.random().toString(36).substr(2, 8);
  let accountAddressIndex = 0;
  const hasNoWallets = await isNoStorageWallet();
  const wallets = await getStorageWallets();
  if (hasNoWallets) {
    //new
    walletName = 'Wallet 1';
  } else {
    walletName = 'Wallet ' + (wallets.length + 1);
  }
  let walletBean: WalletBean = {
    id: walletID,
    name: walletName,
    mnemonic,
    mvcTypes: parseInt(mvcPath),
    isOpen: true,
    addressType: wallet_addressType,
    isBackUp: false,
    isCurrentPathIndex: 0,
    seed: '',
    isColdWalletMode: walletMode,
    accountsOptions: [
      {
        id: accountID,
        name: accountName,
        addressIndex: accountAddressIndex,
        isSelect: true,
        defaultAvatarColor: getRandomColorList(),
      },
    ],
  };

  const btcwallet = await getBtCreateWallet(walletBean);
  const seed = btcwallet.getSeed();
  const saveSeed = seed.toString('hex');
  walletBean.seed = saveSeed;
  const mvcWallet = await getMvcCreateWallet(walletBean, seed);

  const createBean = {
    btcWallet: btcwallet,
    mvcWallet: mvcWallet,
    walletBean: walletBean,
  };

  return createBean;
}

export async function getCurrentWalletAddress(chain: string): Promise<string> {
  let adddress;
  if (chain == 'btc') {
    const btcWallet = await getCurrentBtcWallet();
    adddress = btcWallet.getAddress();
  } else if (chain == 'mvc') {
    const mvcWallet = await getCurrentMvcWallet();
    adddress = mvcWallet.getAddress();
  }
  return adddress;
}

//transaction
export async function sendBtcTransaction(
  address: string,
  receiveAddress: string,
  sendAmount: number,
  feeRate: number,
) {
  const btcWallet = await getCurrentBtcWallet();
  const needRawTx = btcWallet.getScriptType() === ScriptType.P2PKH;
  const utxos = await getBtcUtxos(address, needRawTx);

  // const result = btcWallet.send(receiveAddress, sendAmount, feeRate, utxos);

  // const { fee, rawTx } = btcWallet!.signTx(SignType.SEND, {
  //   utxos,
  //   feeRate: feeRate,
  //   outputs: [{ address: receiveAddress, satoshis: sendAmount as unknown as number }],
  // });

  const result = btcWallet!.signTx(SignType.SEND, {
    utxos,
    feeRate: feeRate,
    outputs: [{ address: receiveAddress, satoshis: sendAmount }],
  });

  return result;
}

//function
// add safe utxo
export async function addMetaletSafeUtxo(rawTx: string, txID: string) {
  const wallet: BtcWallet = await getCurrentBtcWallet();
  const tx = Transaction.fromHex(rawTx);
  if (
    tx.outs.length > 1 &&
    getAddressFromScript(tx.outs[tx.outs.length - 1].script, wallet.getNetwork()) ===
      wallet.getAddress()
  ) {
    console.log('change utxo', `${txID}:${tx.outs.length - 1}`, 'btcAddress' + wallet.getAddress());
    await addSafeUtxo(wallet.getAddress(), `${txID}:${tx.outs.length - 1}`);
  }
}

export async function sendHotBtcTest() {
  const btcWallet = await getCurrentBtcWallet();
  console.log(btcWallet.getAddress());
  console.log(btcWallet.getAddressType());
  const publicKey = btcWallet.getPublicKey().toString('hex');
  const hotWallet = new BtcHotWallet({
    network: 'testnet',
    publicKey: publicKey,
    addressType: AddressType.SameAsMvc,
  });
  console.log(hotWallet.getAddress());
}
