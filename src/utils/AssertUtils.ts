import { BtcFtBean, Mrc20Data } from '@/bean/BtcFtBean';
import {
  fetchAssetsPrice,
  fetchBtcBalance,
  fetchDogeBalance,
  fetchIcons,
  fetchMrc20List,
  fetchMrc20Price,
  fetchMvcFtBalance,
  fetchMvcFtPrice,
  fetchSpaceBalance,
} from '../api/metaletservice';
import { ShowBalance } from '../api/type/Balance';
import { MvcFtData } from '../api/type/MvcFtData';
import { MvcFtPriceData } from '../api/type/Price';
import { formatToDecimal, getWalletNetwork, parseToSpace } from './WalletUtils';
import { Brc20, IcoinsData } from '@/api/type/IcoinsData';
import { getDogeCoinWallet } from '@/chat/wallet/doge/DogeCoinWallet';

// FT
export function caculateOneFtValue(tokens: MvcFtData[], ftPriceData: MvcFtPriceData) {
  let total = 0;
  // const ftPriceData = await fetchMvcFtPrice();
  const mvcPrices = ftPriceData.data.priceInfo;

  for (let i = 0; i < tokens.length; i++) {
    const tokenSymbol = tokens[i].symbol.toUpperCase();
    const quantity = parseFloat(formatToDecimal(tokens[i].confirmed, tokens[i].decimal));
    if (tokenSymbol in mvcPrices) {
      const price = mvcPrices[tokenSymbol];
      const assert = price * quantity;
      total += price * quantity;
    }
  }

  return toFloorNum(total, 2).toFixed(2);
}

export function caculateOneBtcFtValue(tokens: BtcFtBean[], ftPriceData: MvcFtPriceData) {
  let total = 0;
  // const ftPriceData = await fetchMvcFtPrice();
  const mvcPrices = ftPriceData.data.priceInfo;

  for (let i = 0; i < tokens.length; i++) {
    const tokenSymbol = tokens[i].ticker.toLocaleLowerCase();
    const quantity = parseFloat(tokens[i].overallBalance);
    if (tokenSymbol in mvcPrices) {
      const price = mvcPrices[tokenSymbol];
      const assert = price * quantity;
      total += price * quantity;
    }
  }

  return total.toFixed(2);
}

export function caculateOneBtcFtMrc20Value(
  tokens: Mrc20Data[],
  ftPriceData: MvcFtPriceData,
  btcPrice: number,
) {
  let total = 0;
  // const ftPriceData = await fetchMvcFtPrice();
  const mvcPrices = ftPriceData.data.priceInfo;

  for (let i = 0; i < tokens.length; i++) {
    const tokenSymbol = tokens[i].tick.toLocaleUpperCase();
    const quantity = parseFloat(tokens[i].balance);
    const checkID = tokens[i].mrc20Id + '/' + tokenSymbol;
    // console.log("mvcPrices",mvcPrices);
    if (checkID in mvcPrices) {
      const price = mvcPrices[checkID];
      const assert = price * quantity;
      // total += price * quantity * btcPrice;
      total += price * quantity;
    }
  }

  return total.toFixed(2);
}

//balance
export async function caculateMvcAndBtcAssert(mvcAddrss, btcAddress): Promise<ShowBalance> {
  const balance: ShowBalance = new ShowBalance();
  const assertPrice = await fetchAssetsPrice();
  const network = await getWalletNetwork();
  let isMain = network === 'mainnet' ? true : false;
  const btcPrice = assertPrice.data.priceInfo.btc;
  const spacePrice = assertPrice.data.priceInfo.space;
  const dogePrice = assertPrice.data.priceInfo.doge;
  // const dogePrice = 0;
  const time1 = new Date().getTime();
  //当前时间毫秒数
  // console.log("开始计算：",time1);

  const spaceBalanceData = await fetchSpaceBalance(mvcAddrss);

  if (spaceBalanceData == null) {
    return balance;
  }

  const spaceSumBalance = parseFloat(
    parseToSpace((spaceBalanceData.confirmed + spaceBalanceData.unconfirmed).toString()),
  ).toString();
  balance.spaceBalance = spaceSumBalance;
  const spaceAssert = toFloorNum(spacePrice * parseFloat(spaceSumBalance), 2);
  balance.spaceAssert = isMain ? spaceAssert.toFixed(2) : '0.0';

  const dogeAddress=await (await getDogeCoinWallet()).getAddress();
  const dogeBalanceData = await fetchDogeBalance(dogeAddress);

  const dogeSumBalance = parseFloat(
    parseToSpace((dogeBalanceData.confirmed + dogeBalanceData.unconfirmed).toString()),
  ).toString();
  balance.dogeBalance = dogeSumBalance;
  const dogeAssert = toFloorNum(dogePrice * parseFloat(dogeSumBalance), 2);
  balance.dogeAssert = isMain ? dogeAssert.toFixed(2) : '0.0';

  const btcBalanceData = await fetchBtcBalance(btcAddress);
  if (btcBalanceData.data == null) {
    console.log('btcBalanceData', btcBalanceData.data);

    return balance;
  }

  const btcBalance = (balance.btcBalance = btcBalanceData.data.balance.toString());
  const btcAssert = toFloorNum(btcPrice * parseFloat(btcBalance), 2);
  balance.btcAssert = isMain ? btcAssert.toString() : '0.0';
  let assertSum = toFloorNum(spaceAssert + btcAssert, 2);
  balance.btcNa = (btcBalanceData.data.balance - btcBalanceData.data.safeBalance).toFixed(8);
  balance.btcSafeBalance = btcBalanceData.data.safeBalance.toFixed(8);

  const ftPriceData = await fetchMvcFtPrice();

  const ftdata = await fetchMvcFtBalance(mvcAddrss);
  if (ftdata) {
    const assertFt = caculateOneFtValue(ftdata, ftPriceData);
    assertSum = toFloorNum(parseFloat(assertFt) + assertSum, 2);
  }

  //mrc20 list
  const ftPriceMrc20Data = await fetchMrc20Price();
  const simData = await fetchMrc20List(network, btcAddress);
  if (simData) {
    const assertFt = caculateOneBtcFtMrc20Value(simData.data.list, ftPriceMrc20Data, btcPrice);
    assertSum = toFloorNum(parseFloat(assertFt) + assertSum, 2);
  }

  balance.sumAssert = assertSum.toFixed(2);
  // console.log("计算完成返回的时间差是：",new Date().getTime()-time1);

  // console.log("assert" + JSON.stringify(balance));
  return balance;
}

//utils b 45 bao 2
export function toFloorNum(value: number, num: number) {
  const factor = Math.pow(10, num);
  const reuslt = Math.floor(value * factor) / factor;
  return reuslt;
}

//btc icon
export const btcBaseIconUrl = 'https://www.metalet.space/wallet-api';

export function getBtcBrc20Icon(ftName: string) {
  let iconPic = '';

  switch (ftName.toLocaleLowerCase()) {
    case 'bili':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/bili.jpg';
      break;
    case 'btcs':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/btcs.jpg';
      break;
    case 'cats':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/cats.jpg';
      break;
    case 'fish':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/fish.jpg';
      break;
    case 'grum':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/grum.png';
      break;
    case 'ibtc':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/ibtc.jpg';
      break;
    case 'lger':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/lger.jpg';
      break;
    case 'ordi':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/ordi.svg';
      break;
    case 'orxc':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/orxc.png';
      break;
    case 'oxbt':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/oxbt.png';
      break;
    case 'rats':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/rats.jpg';
      break;
    case 'rdex':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/rdex.png';
      break;
    case 'sats':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/sats.jpg';
      break;
    case 'sayc':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/sayc.jpg';
      break;
    case 'trac':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/trac.png';
      break;
    case 'vmpx':
      iconPic = btcBaseIconUrl + '/v3/coin/brc20/icon/vmpx.jpg';
      break;
  }
  return iconPic;
}

export function getOneIcons(tag: string, ticker: string, iconsData: IcoinsData) {
  let icon;
  // const iconsData: IcoinsData = await fetchIcons();
  // console.log(iconsData);
  if (tag === 'brc20') {
    const brc20: Brc20 = iconsData.data.brc20_coin;
    if (ticker in brc20) {
      icon = brc20[ticker];
    }
  }
  return icon;
}
