export interface MvcFtPriceData {
  code: number;
  message: string;
  processingTime: number;
  data: MvcftPriceList;
}

export interface MvcftPriceList {
  priceInfo: MvcFtPrices;
}

export interface MvcFtPrices {
  MC: number;
  MSP: number;
  SHOW: number;
  USDT: number;
  VEMSP: number;
  '星能': number;
}