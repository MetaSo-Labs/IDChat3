// const SHOW3_SERVICE = "api.show3.space";
const SHOW3_SERVICE = "api.show3.io";


//转换图片
export const getShowImageUrl=(url:string)=>{
   
    let resultUrl = "";
    resultUrl = url.replaceAll("metafile://", "");

    if (resultUrl.endsWith(".png")) {
      resultUrl = resultUrl.replaceAll(".png", "");
    }

    if (resultUrl.endsWith(".jpg")) {
      resultUrl = resultUrl.replaceAll(".png", "");
    }

    resultUrl = `https://${SHOW3_SERVICE}/metafile/${resultUrl}`;
    return resultUrl;

}

export const checkImage = async (uri) => {
  try {
    const response = await fetch(uri);
    return response.ok;
  } catch (error) {
    console.error('Error checking image:', error);
    return false;
  }
};





export const formatTime= (timestamp:number)=>{
  // const timestamp = 1623369476000; // 你的时间戳
  console.log("timestamp",timestamp);
  
  const date = new Date(timestamp);
  
  const year = date.getFullYear(); // 获取年份
  const month = date.getMonth() + 1; // 获取月份，需要加 1，因为月份是从 0 开始计数的
  const day = date.getDate(); // 获取日期
  const hours = date.getHours(); // 获取小时
  const minutes = date.getMinutes(); // 获取分钟
  const seconds = date.getSeconds(); // 获取秒数
  
  // 将获取的年月日时分秒拼接成字符串
  const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  
  return formattedDate;
  // console.log(formattedDate); // 输出格式化后的日期时间字符串，如：2022-06-10 15:12:56
}



export const getRandomColorList=()=>{
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const defaultAvatarColor:string []= [];
  defaultAvatarColor[0]=getRandomColor();
  defaultAvatarColor[1]=getRandomColor();

  return defaultAvatarColor;
}