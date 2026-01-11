import { AddressType, Chain } from '@metalet/utxo-wallet-sdk';
import { getNetwork } from '../network';
import { getDogeDerivationPath, getDogeNetwork } from './network';
// import BIP32Factory, { BIP32Interface } from 'bip32'
import * as bitcoinjs from 'bitcoinjs-lib';
import { Platform } from 'react-native';
import { mnemonicToSeedSync } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import * as bitcoin from 'bitcoinjs-lib';
import bs58check from 'bs58check';
// Use runtime-selected ECC backend to avoid loading native binaries on iOS at module init.
let _ecc: any = null;
async function ensureEcc() {
  if (_ecc) return _ecc;
  try {
    // prefer noble on iOS to avoid native binary / JSI issues
    if (Platform.OS === 'ios') {
      const noble = await import('@noble/secp256k1');
      _ecc = {
        sign: async (msg: Uint8Array, priv: Uint8Array) => {
          const sig = await noble.sign(msg, priv);
          return sig instanceof Uint8Array ? sig : Uint8Array.from(sig);
        },
        pointFromScalar: (priv: Uint8Array) => {
          return noble.getPublicKey(priv, true);
        },
      };
      console.log('[wallet] forced @noble/secp256k1 on iOS');
      return _ecc;
    }
    // try native-backed first on non-iOS, fall back to noble on error
    try {
      const native = await import('@bitcoinerlab/secp256k1');
      // probe
      native.pointFromScalar(new Uint8Array(32).fill(1));
      _ecc = native;
      return _ecc;
    } catch (e) {
      const noble = await import('@noble/secp256k1');
      _ecc = {
        sign: async (msg: Uint8Array, priv: Uint8Array) => {
          const sig = await noble.sign(msg, priv);
          return sig instanceof Uint8Array ? sig : Uint8Array.from(sig);
        },
        pointFromScalar: (priv: Uint8Array) => {
          return noble.getPublicKey(priv, true);
        },
      };
      return _ecc;
    }
  } catch (err) {
    // final fallback: noble
    const noble = await import('@noble/secp256k1');
    _ecc = {
      sign: async (msg: Uint8Array, priv: Uint8Array) => {
        const sig = await noble.sign(msg, priv);
        return sig instanceof Uint8Array ? sig : Uint8Array.from(sig);
      },
      pointFromScalar: (priv: Uint8Array) => {
        return noble.getPublicKey(priv, true);
      },
    };
    return _ecc;
  }
}

// import ECPairFactory, { ECPairAPI, ECPairInterface } from "ecpair";
import Decimal from 'decimal.js';

// DOGE network type - can be livenet (mainnet) or testnet
type DogeNetworkType = 'livenet' | 'testnet';

// let ECPair: ECPairAPI | null = null;
// let eccInitialized = false;

// export async function ensureEccInitialized(): Promise<ECPairAPI> {
//   if (!eccInitialized) {
//     ECPair = ECPairFactory(ecc);
//     eccInitialized = true;
//   }
//   return ECPair!;
// }

// async function ensureEccInitialized() {
//   if (!eccInitialized) {
//     // 动态导入 ecc 库，避免在模块加载时就执行
//     const ecc = await import('@bitcoinerlab/secp256k1')
//     bitcoin.initEccLib(ecc)
//     ECPair = ECPairFactory(ecc)
//     eccInitialized = true
//   }
//   return ECPair!
// }

const DERIVATION_PATH = "m/44'/3'/0'/0/0"; // Dogecoin BIP44 路径

export interface DogeUTXO {
  txId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
  rawTx?: string;
  confirmed?: boolean;
  height?: number;
}

export interface DogeTransferOutput {
  address: string;
  satoshis: number;
}

export interface DogeSignResult {
  txId: string;
  rawTx: string;
  fee: number;
}

export class DogeWallet {
  private mnemonic: string;
  private network: DogeNetworkType;
  private addressIndex: number;
  private dogeAddressType: string;
  private coinType: number;
  private child: HDKey;
  private dogeNetwork: bitcoinjs.Network;

  constructor(options: {
    mnemonic: string;
    network?: DogeNetworkType;
    addressIndex?: number;
    coinType?: number;
    dogeAddressType?: AddressType;
  }) {
    this.mnemonic = options.mnemonic;
    // const netValue = getNet()
    const netValue = getNetwork(Chain.BTC);

    this.network = options.network || (netValue === 'livenet' ? 'livenet' : 'testnet');
    this.addressIndex = options.addressIndex ?? 0;
    this.dogeNetwork = getDogeNetwork(this.network);

    // Derive the child key
    // const path = getDogeDerivationPath(this.addressIndex);
    let path;
    if (
      AddressType.DogeSameAsMvc == options.dogeAddressType ||
      options.dogeAddressType == AddressType.SameAsMvc
    ) {
      path = `m/44'/${options.coinType}'/0'/0/0`;
    } else {
      path = DERIVATION_PATH;
    }

    this.child = this.deriveChild(path);
  }

  /**
   * Derive child key from mnemonic and path
   */
  private deriveChild(path: string): HDKey {
    // if (!bip39.validateMnemonic(this.mnemonic, wordlist)) {
    //   throw new Error('Invalid mnemonic')
    // }

    const seed = mnemonicToSeedSync(this.mnemonic);
    // const seedBuf = Buffer.from(seed)
    const root = HDKey.fromMasterSeed(seed);
    // const master = bip32.fromSeed(seedBuf, this.dogeNetwork)

    return root.derive(path);
  }

  /**
   * Get DOGE address (P2PKH only)
   */
  getAddress(): string {
    const { payments } = bitcoinjs;
    const payment = payments.p2pkh({
      pubkey: Buffer.from(this.child.publicKey),
      network: this.dogeNetwork,
    });

    if (!payment.address) {
      throw new Error('Failed to generate DOGE address');
    }

    return payment.address;
  }

  /**
   * Get public key
   */
  getPublicKey(): Buffer {
    return Buffer.from(this.child.publicKey);
  }

  /**
   * Get public key as hex string
   */
  getPublicKeyHex(): string {
    return Buffer.from(this.child.publicKey).toString('hex');
  }

  /**
   * Get private key in WIF format
   */
  getPrivateKeyWIF(): string {
    const prefix = Buffer.from([0x9e]); // DOGE WIF 前缀
    const key = Buffer.from(this.child.privateKey); // 32 字节私钥
    const compressed = Buffer.from([0x01]); // 压缩标志

    return bs58check.encode(Buffer.concat([prefix, key, compressed]));
  }

  /**
   * Get network
   */
  getNetwork(): bitcoinjs.Network {
    return this.dogeNetwork;
  }

  /**
   * RN-compatible signer using @bitcoinerlab/secp256k1 (ecc).
   * Returns an object with `publicKey` and `sign(hash)` to be compatible with bitcoinjs-lib PSBT.
   */
  async getSigner(): Promise<any> {
    if (!this.child.privateKey) {
      throw new Error('Private key not available');
    }

    const priv = Buffer.from(this.child.privateKey);
    // get compressed public key from private scalar
    const pubarr = (await ensureEcc()).pointFromScalar(new Uint8Array(priv), true);
    if (!pubarr) throw new Error('Failed to derive public key');
    const pub = Buffer.from(pubarr);

    const signer = {
      publicKey: pub,
      // return compact 64-byte signature (r||s) as expected by bitcoinjs-lib PSBT
      sign: async (hash: Buffer) => {
        const sig = (await ensureEcc()).sign(new Uint8Array(hash), new Uint8Array(priv));
        return Buffer.from(sig);
      },
    };

    return signer;
  }

  /**
   * Calculate total satoshis from UTXOs
   */
  private getTotalSatoshi(utxos: DogeUTXO[]): Decimal {
    return utxos.reduce((total, utxo) => total.add(utxo.satoshis), new Decimal(0));
  }

  /**
   * Estimate transaction fee
   * DOGE typically uses 1 DOGE/KB minimum fee
   * feeRate is in satoshis per KB (e.g., 100000 = 0.001 DOGE/KB)
   */
  private estimateFee(inputCount: number, outputCount: number, feeRate: number): number {
    // P2PKH input: ~148 bytes, P2PKH output: ~34 bytes, overhead: ~10 bytes
    const estimatedSize = inputCount * 148 + outputCount * 34 + 10;
    // feeRate is sat/KB, convert to sat/byte by dividing by 1000
    const feeRatePerByte = feeRate / 1000;
    return Math.ceil(estimatedSize * feeRatePerByte);
  }

  /**
   * Build and sign a DOGE transaction
   */
  async signTransaction(options: {
    utxos: DogeUTXO[];
    outputs: DogeTransferOutput[];
    feeRate: number;
    changeAddress?: string;
  }): Promise<DogeSignResult> {
    const { utxos, outputs, feeRate, changeAddress } = options;

    if (!utxos.length) {
      throw new Error('No UTXOs available');
    }

    const { payments, Psbt, Transaction } = bitcoinjs;
    const address = this.getAddress();
    const payment = payments.p2pkh({
      pubkey: Buffer.from(this.child.publicKey),
      network: this.dogeNetwork,
    });

    // Calculate total output amount
    const totalOutput = outputs.reduce((sum, out) => sum.add(out.satoshis), new Decimal(0));
    const totalInput = this.getTotalSatoshi(utxos);

    // Estimate fee
    const outputCount = outputs.length + 1; // +1 for potential change output
    const estimatedFee = this.estimateFee(utxos.length, outputCount, feeRate);

    // Check if we have enough balance
    if (totalInput.lt(totalOutput.add(estimatedFee))) {
      throw new Error('Insufficient balance');
    }

    // Build the transaction using Psbt
    const psbt = new Psbt({ network: this.dogeNetwork });

    // Add inputs
    for (const utxo of utxos) {
      if (!utxo.rawTx) {
        throw new Error(`Raw transaction required for UTXO ${utxo.txId}`);
      }

      const tx = Transaction.fromHex(utxo.rawTx);
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.outputIndex,
        nonWitnessUtxo: tx.toBuffer(),
      });
    }

    // Add outputs
    for (const output of outputs) {
      psbt.addOutput({
        address: output.address,
        value: output.satoshis,
      });
    }

    // Add change output if needed
    const change = totalInput.minus(totalOutput).minus(estimatedFee);
    if (change.gt(100000)) {
      // Only add change if it's more than dust (0.001 DOGE)
      psbt.addOutput({
        address: changeAddress || address,
        value: change.toNumber(),
      });
    }

    // Sign all inputs
    const signer = await this.getSigner();
    psbt.signAllInputs(signer);
    psbt.finalizeAllInputs();

    // Extract the transaction
    const tx = psbt.extractTransaction();
    const rawTx = tx.toHex();
    const txId = tx.getId();

    // Calculate actual fee
    const actualFee = totalInput.minus(tx.outs.reduce((sum, out) => sum + out.value, 0)).toNumber();

    return {
      txId,
      rawTx,
      fee: actualFee,
    };
  }

  /**
   * Sign a message with the private key
   */
  async signMessage(message: string): Promise<string> {
    const signer = await this.getSigner();
    const messageHash = bitcoinjs.crypto.sha256(Buffer.from(message));
    const signature = await signer.sign(messageHash);
    return signature.toString('hex');
  }
}

/**
 * Derive DOGE address from mnemonic
 */
export function deriveDogeAddress(
  mnemonic: string,
  network: DogeNetworkType,
  addressIndex: number = 0,
): string {
  const wallet = new DogeWallet({ mnemonic, network, addressIndex });
  return wallet.getAddress();
}

/**
 * Derive DOGE public key from mnemonic
 */
export function deriveDogePublicKey(
  mnemonic: string,
  network: DogeNetworkType,
  addressIndex: number = 0,
): string {
  const wallet = new DogeWallet({ mnemonic, network, addressIndex });
  return wallet.getPublicKeyHex();
}

/**
 * Validate DOGE address
 */
export function isValidDogeAddress(address: string, network: DogeNetworkType = 'livenet'): boolean {
  try {
    const dogeNetwork = getDogeNetwork(network);
    // DOGE mainnet addresses start with 'D' or '9'/'A' for script hash
    // DOGE testnet addresses start with 'n'
    if (network === 'livenet') {
      if (!address.startsWith('D') && !address.startsWith('9') && !address.startsWith('A')) {
        return false;
      }
    } else {
      if (!address.startsWith('n')) {
        return false;
      }
    }

    // Try to decode the address
    bitcoinjs.address.toOutputScript(address, dogeNetwork);
    return true;
  } catch {
    return false;
  }
}
