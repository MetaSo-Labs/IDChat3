export interface RootObject {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

interface Data {
  priceInfo: PriceInfo;
}

interface PriceInfo {
  MC: number;
  MSP: number;
  SHOW: number;
  USDT: number;
  VEMSP: number;
  '星能': number;
}