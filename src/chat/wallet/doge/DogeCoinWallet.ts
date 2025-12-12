import { RootDataObject, RootDataObject2 } from '@/api/type/RootDataObject';
import { ToastView } from '@/constant/Widget';
import { isEmpty } from '@/utils/StringUtils';
import { getStorageCurrentWallet } from '@/utils/WalletUtils';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as bip39 from '@scure/bip39';
import * as dogecoin from 'dogecoinjs-lib';
import { Transaction } from 'dogecoinjs-lib';

const DERIVATION_PATH = "m/44'/3'/0'/0/0"; // Dogecoin BIP44 路径

export interface DogeUTXO {
  address: string;
  flag: string;
  height: number;
  outIndex: number;
  value: number; // DOGE 数量字符串
  txid: string;
}

export interface DogeBroadcastResult {
  TxId: string;
}

export class DogeCoinWallet {
  mnemonic: string;
  privateKey: Buffer;
  publicKey: Buffer;
  address: string;

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;

    //1.从助记词生成Seed
    const seed = mnemonicToSeedSync(mnemonic); // Uint8Array
    const root = HDKey.fromMasterSeed(seed);

    //2.用DOGE 派生子密钥
    const child = root.derive(DERIVATION_PATH);

    this.privateKey = Buffer.from(child.privateKey!);
    this.publicKey = Buffer.from(child.publicKey);

    // this.address = ''; // will be set by the async factory
  }

  async getAddress(): Promise<string> {
    const pubHex = Buffer.from(this.publicKey).toString('hex');
    console.log('Public Key Hex: ' + pubHex);
    console.log(' Hex: ' + this.publicKey.toString('hex'));

    const address = await dogecoin.generateAddress(this.publicKey.toString('hex'));
    this.address = address!;
    return address;
  }

  async getUTXOs(): Promise<DogeUTXO[]> {
    if (!this.address) throw new Error('Address not generated yet');
    const url = `https://www.metalet.space/wallet-api/v4/doge/address/utxo-list?net=livent&address=${this.address}`;
    const res = await fetch(url);
    const data: RootDataObject2 = await res.json();
    console.log('Dogecoin UTXOs:', data);
    const list = data.data.list as DogeUTXO[];
    return list.map((u) => ({
      ...u,
      value: normalizeToSatoshi(u.value),
    }));
  }

  /** 计算余额 */
  async getBalance(): Promise<number> {
    const utxos = await this.getUTXOs();
    return utxos.reduce((sum, u) => sum + (u.value || 0), 0); // satoshi
  }

  /** 构建并签名交易 */
  async buildAndSignTx(targetAddress: string, amountDoge: number, feeDoge = 1): Promise<string> {
    const utxos = await this.getUTXOs();
    const totalBalance = utxos.reduce((sum, u) => sum + (u.value || 0), 0);
    const amount = Math.floor(amountDoge * 1e8);

    console.log(`Total Balance: ${(totalBalance / 1e8).toFixed(8)} DOGE`);
    if (totalBalance < amount + feeDoge) {
      ToastView({ text: 'Insufficient balance', type: 'error' });
      throw new Error(`Insufficient balance`);
    }

    const tx = new Transaction();
    let inputSum = 0;
    let utxoList: dogecoin.UTXO[] = [];
    for (const u of utxos) {
      const dogeUtxo: dogecoin.UTXO = {
        id: u.txid,
        index: u.outIndex,
      };
      utxoList.push(dogeUtxo);
      inputSum += u.value || 0;
      if (inputSum >= amount + 1) break;
    }

    for (const dUtxo of utxoList) {
      await tx.addInput(dUtxo);
    }

    const fee = estimateDogeFee(utxoList.length, 2);
    await tx.addOutput({ address: targetAddress, amount: Number(amountDoge) });
    console.log('Fee:', fee);
    console.log('Amount:', inputSum / 1e8);
    // 找零
    const change = inputSum - amount - fee.feeDoge * 1e8;
    if (change > 0) {
      console.log('change', change / 1e8);
      await tx.addOutput({ address: await this.address, amount: change / 1e8 });
    }
    await tx.signAll(this.publicKey.toString('hex'), this.privateKey.toString('hex'));
    const signedHex = await tx.getSignedHex();
    return signedHex;
  }

  /** 广播交易 */
  async broadcastTx(txHex: string): Promise<any> {
    const res = await fetch('https://www.metalet.space/wallet-api/v4/doge/tx/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawTx: txHex, net: 'livenet' }),
    });
    const data: RootDataObject = await res.json();
    const result = data.data as DogeBroadcastResult;
    if (isEmpty(result.TxId)) {
      ToastView({ text: data.message, type: 'error' });
      return null;
    }
    return result.TxId;
  }
}

export async function getDogeCoinWallet() {
  const mnemonic = (await getStorageCurrentWallet()).mnemonic;
  if (!mnemonic) throw new Error('No mnemonic');
  const wallet = new DogeCoinWallet(mnemonic);
  return wallet;
}

function normalizeToSatoshi(value: number | string): number {
  const v = Number(value);
  if (v > 1e6) {
    return Math.floor(v);
  }
  return Math.floor(v * 1e8);
}

export function estimateDogeFee(inputs: number, outputs: number) {
  // 1. 估算交易大小
  const txBytes = 10 + inputs * 148 + outputs * 34;
  // 2. Doge 默认费率：1 DOGE / KB = 0.001 DOGE/byte
  const feeDoge = txBytes * 0.001;
  return {
    bytes: txBytes,
    feeDoge,
  };
}
