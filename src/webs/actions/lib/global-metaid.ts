/**
 * GlobalMetaId 工具
 * 将不同链的地址（MVC、BTC、DOGE）转换为统一的 GlobalMetaId
 *
 * 相同派生路径的地址会产生相同的 GlobalMetaId，因为它们共享相同的公钥哈希
 */

// import { createHash } from 'crypto'

// ============= 地址版本类型 =============
import { sha256 as nobleSha256 } from '@noble/hashes/sha2';

enum AddressVersion {
  P2PKH = 0, // Pay-to-PubKey-Hash
  P2SH = 1, // Pay-to-Script-Hash
  P2WPKH = 2, // Pay-to-Witness-PubKey-Hash
  P2WSH = 3, // Pay-to-Witness-Script-Hash
  P2MS = 4, // Pay-to-Multisig
  P2TR = 5, // Pay-to-Taproot
}

// ============= SHA256 哈希 =============

function sha256(data: Uint8Array): Uint8Array {
  // const msgHash = nobleSha256('msg');

  // return new Uint8Array(createHash('sha256').update(data).digest())
  return nobleSha256(data);
}

function doubleSHA256(data: Uint8Array): Uint8Array {
  return sha256(sha256(data));
}

// ============= Base58 编解码 =============

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0);

  let num = BigInt(0);
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base58 character: ${char}`);
    }
    num = num * BigInt(58) + BigInt(index);
  }

  const bytes: number[] = [];
  while (num > 0) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }

  for (const char of str) {
    if (char === '1') {
      bytes.unshift(0);
    } else {
      break;
    }
  }

  return new Uint8Array(bytes);
}

function base58CheckDecode(str: string): { version: number; payload: Uint8Array } {
  const decoded = base58Decode(str);

  if (decoded.length < 5) {
    throw new Error('Decoded data too short');
  }

  const data = decoded.slice(0, -4);
  const checksum = decoded.slice(-4);

  const expectedChecksum = doubleSHA256(data);
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expectedChecksum[i]) {
      throw new Error('Checksum mismatch');
    }
  }

  return {
    version: data[0],
    payload: data.slice(1),
  };
}

// ============= Bech32 编解码 =============

enum Bech32Encoding {
  Bech32 = 1,
  Bech32m = 2,
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_CHARSET_MAP: Record<string, number> = {};
for (let i = 0; i < BECH32_CHARSET.length; i++) {
  BECH32_CHARSET_MAP[BECH32_CHARSET[i]] = i;
}

function bech32Polymod(values: number[]): number {
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) {
        chk ^= gen[i];
      }
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) >> 5);
  }
  result.push(0);
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) & 31);
  }
  return result;
}

function bech32VerifyChecksum(hrp: string, data: number[], encoding: Bech32Encoding): boolean {
  const values = [...bech32HrpExpand(hrp), ...data];
  const polymod = bech32Polymod(values);

  const bech32Const = 1;
  const bech32mConst = 0x2bc830a3;

  return encoding === Bech32Encoding.Bech32 ? polymod === bech32Const : polymod === bech32mConst;
}

function convertBits(data: Uint8Array, fromBits: number, toBits: number, pad: boolean): Uint8Array {
  let acc = 0;
  let bits = 0;
  const result: number[] = [];
  const maxv = (1 << toBits) - 1;

  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxv);
    }
  }

  if (pad) {
    if (bits > 0) {
      result.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
    throw new Error('Invalid padding');
  }

  return new Uint8Array(result);
}

function bech32Decode(addr: string): {
  hrp: string;
  version: number;
  program: Uint8Array;
  encoding: Bech32Encoding;
} {
  addr = addr.toLowerCase();

  const pos = addr.lastIndexOf('1');
  if (pos < 1 || pos + 7 > addr.length || addr.length > 90) {
    throw new Error('Invalid bech32 address format');
  }

  const hrp = addr.slice(0, pos);
  const data = addr.slice(pos + 1);

  const decoded: number[] = [];
  for (const char of data) {
    const val = BECH32_CHARSET_MAP[char];
    if (val === undefined) {
      throw new Error(`Invalid bech32 character: ${char}`);
    }
    decoded.push(val);
  }

  let encoding = Bech32Encoding.Bech32m;
  if (!bech32VerifyChecksum(hrp, decoded, Bech32Encoding.Bech32m)) {
    encoding = Bech32Encoding.Bech32;
    if (!bech32VerifyChecksum(hrp, decoded, Bech32Encoding.Bech32)) {
      throw new Error('Invalid bech32 checksum');
    }
  }

  const dataWithoutChecksum = decoded.slice(0, -6);

  if (dataWithoutChecksum.length < 1) {
    throw new Error('Invalid bech32 data length');
  }

  const version = dataWithoutChecksum[0];

  const program = convertBits(new Uint8Array(dataWithoutChecksum.slice(1)), 5, 8, false);

  if (program.length < 2 || program.length > 40) {
    throw new Error('Invalid witness program length');
  }

  if (version === 0 && encoding !== Bech32Encoding.Bech32) {
    throw new Error('Witness version 0 must use bech32');
  }
  if (version !== 0 && encoding !== Bech32Encoding.Bech32m) {
    throw new Error('Witness version 1+ must use bech32m');
  }

  return { hrp, version, program, encoding };
}

// ============= IDAddress 编解码 =============

const IDADDRESS_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const VERSION_CHARS = ['q', 'p', 'z', 'r', 'y', 't'];

function idPolymod(values: number[]): number {
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) {
        chk ^= gen[i];
      }
    }
  }
  return chk;
}

function idHrpExpand(hrp: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) >> 5);
  }
  result.push(0);
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) & 31);
  }
  return result;
}

function createIdChecksum(data: number[], version: AddressVersion): number[] {
  // HRP 包含版本字符，如 'idq' for P2PKH, 'idz' for P2WPKH 等
  const versionChar = VERSION_CHARS[version];
  const hrp = 'id' + versionChar;
  const values = [...idHrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
  const mod = idPolymod(values) ^ 1;

  const checksum: number[] = [];
  for (let i = 0; i < 6; i++) {
    checksum.push((mod >> (5 * (5 - i))) & 31);
  }
  return checksum;
}

function convertBits8to5(data: Uint8Array): number[] {
  let acc = 0;
  let bits = 0;
  const result: number[] = [];
  const maxv = 31;

  for (const value of data) {
    acc = (acc << 8) | value;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result.push((acc >> bits) & maxv);
    }
  }

  if (bits > 0) {
    result.push((acc << (5 - bits)) & maxv);
  }

  return result;
}

function encodeIDAddress(version: AddressVersion, data: Uint8Array): string {
  if (version < 0 || version > 5) {
    throw new Error(`Invalid version: ${version}`);
  }

  const converted = convertBits8to5(data);

  // 校验和基于数据计算，版本信息已包含在 HRP 中（如 'idq'）
  const checksum = createIdChecksum(converted, version);

  // 输出的数据部分不包含版本号（版本号已在前缀 'idq1' 中的 'q' 表示）
  const finalData = [...converted, ...checksum];

  const versionChar = VERSION_CHARS[version];
  let result = 'id' + versionChar + '1';
  for (const d of finalData) {
    result += IDADDRESS_CHARSET[d];
  }

  return result;
}

// ============= 地址转换 =============

function convertFromLegacyAddress(version: number, payload: Uint8Array): string {
  let idVersion: AddressVersion;

  switch (version) {
    case 0x00: // Bitcoin 主网 P2PKH
    case 0x6f: // Bitcoin 测试网 P2PKH
    case 0x1e: // Dogecoin 主网 P2PKH
      idVersion = AddressVersion.P2PKH;
      break;
    case 0x05: // Bitcoin 主网 P2SH
    case 0xc4: // Bitcoin 测试网 P2SH
    case 0x16: // Dogecoin 主网 P2SH
      idVersion = AddressVersion.P2SH;
      break;
    default:
      throw new Error(`Unsupported version byte: 0x${version.toString(16)}`);
  }

  return encodeIDAddress(idVersion, payload);
}

function convertFromSegWitAddress(
  hrp: string,
  witnessVersion: number,
  program: Uint8Array,
): string {
  if (hrp !== 'bc' && hrp !== 'tb') {
    throw new Error(`Unsupported network: ${hrp}`);
  }

  switch (witnessVersion) {
    case 0:
      if (program.length === 20) {
        return encodeIDAddress(AddressVersion.P2WPKH, program);
      } else if (program.length === 32) {
        return encodeIDAddress(AddressVersion.P2WSH, program);
      }
      throw new Error(`Invalid witness v0 program length: ${program.length}`);
    case 1:
      if (program.length === 32) {
        return encodeIDAddress(AddressVersion.P2TR, program);
      }
      throw new Error(`Invalid taproot program length: ${program.length}`);
    default:
      throw new Error(`Unsupported witness version: ${witnessVersion}`);
  }
}

/**
 * 将任意区块链地址转换为 GlobalMetaId
 * 支持 Bitcoin（Legacy、SegWit、Taproot）、Dogecoin、MVC 地址
 *
 * @param address - 区块链地址
 * @returns GlobalMetaId 字符串（以 "id" 开头）
 *
 * @example
 * // MVC/Bitcoin Legacy 地址
 * convertToGlobalMetaId('195gtuVbW9DsKPnSZLrt9kdJrQmvrAt7e3')
 * // => 'idq1tz3ljq763lqsj2wp894h06vxn0ndhnsq3fllnj'
 *
 * // Dogecoin 地址（与 MVC 同 path 时返回相同 GlobalMetaId）
 * convertToGlobalMetaId('DDDnSASEoZ89rPy3HvrShWnujYWEABGhUB')
 * // => 'idq1tz3ljq763lqsj2wp894h06vxn0ndhnsq3fllnj'
 *
 * // SegWit 地址
 * convertToGlobalMetaId('bc1qfxd3xp3q65ulewmzrfx50pxw45qjfvgdsfq4ah')
 * // => 'idz1fxd3xp3q65ulewmzrfx50pxw45qjfvgd0j24uz'
 */
export function convertToGlobalMetaId(address: string): string {
  // 尝试 Base58Check 解码 (传统地址)
  try {
    const { version, payload } = base58CheckDecode(address);
    return convertFromLegacyAddress(version, payload);
  } catch {
    // 继续尝试 Bech32
  }

  // 尝试 Bech32 解码 (SegWit 地址)
  try {
    const { hrp, version, program } = bech32Decode(address);
    return convertFromSegWitAddress(hrp, version, program);
  } catch {
    throw new Error(`Unsupported address format: ${address}`);
  }
}

/**
 * 验证 GlobalMetaId 格式是否有效
 *
 * @param globalMetaId - 要验证的 GlobalMetaId
 * @returns 是否有效
 */
export function validateGlobalMetaId(globalMetaId: string): boolean {
  try {
    const addr = globalMetaId.toLowerCase();

    if (!addr.startsWith('id')) {
      return false;
    }

    const versionChar = addr[2];
    if (!VERSION_CHARS.includes(versionChar)) {
      return false;
    }

    if (addr[3] !== '1') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
