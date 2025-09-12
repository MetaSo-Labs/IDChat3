import { JsxEmit } from "typescript";

export const BASE_MVC_API_URL = "https://mainnet.mvcapi.com";
export const BASE_MVC_API_URL_TESTNET = "https://testnet.mvcapi.com";
export const BASE_METALET_URL = "https://www.metalet.space";

// 具体
//btc ft
export const BTC_FT_URL = BASE_METALET_URL + "/wallet-api/v3/brc20/tokens";
//btc nft
export const BTC_NFT_URL =
  BASE_METALET_URL + "/wallet-api/v3/address/inscriptions";

//资产价格
export const BALANCE_PRICE_URL = BASE_METALET_URL + "/wallet-api/v3/coin/price";

//get
export const get = async (
  url: string,
  isFullUrl: boolean = true,
  params?: {}
) => {
  // 将参数拼接到URL中
  let queryString;
  if (params !== undefined) {
    queryString = Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
  }

  const fullUrl = isFullUrl ? url : `${url}?${queryString}`;
  //   const fullUrl = `${BASE_MVC_API_URL}${url}?${queryString}`;
  // console.log("fullUrl", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body:JSON.stringify(params)
    });
    
    if (!response.ok) {
      console.log("fullUrl请求出错的接口 ： ", fullUrl);
      return null;
      // throw new Error(response.statusText);
    }
    // console.log(response);
    return await response.json();
  } catch (error) {
    console.log("Get Rqeuest Error:", fullUrl);

    console.error("Get Rqeuest Error:", error);
    // throw error;
  }
};

export const post = async (url, data = {}) => {
  // console.log("data "+JSON.stringify(data));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization':`Bearer ${token}'
      },
      //携带参数
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.log("fullUrl请求出错的接口 ： ", url);
      return null;
      // throw new Error(response.statusText);
    }
    // console.log("response", response.url);
    return await response.json();
  } catch (error) {
    console.log("Get Rqeuest Error:", url);
    console.error("Post Rqeuest Error:", JSON.stringify(error));
    // throw error;
  }
};

// fetchData() 匿名函数写法
// const fetchData = async () => {
//     const data=await  get(BASE_MVC_API_URL+"/address/1C2XjqoXHRegJNnmJqGDMt3rbAcrYLX4L9/balance",  {},{isFullUrl:true});
//     console.log(data);
// }
