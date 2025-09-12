export const raise = (msg: string) => {
  throw new Error(msg)
}

export const toTx = async (txid: string, browserHost: string) => {
  window.open(`${browserHost}/tx/${txid}`, '_blank')
}

export const generateRandomString = (length: number = 32) => {
  let randomString = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return randomString
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function transferToNumber(inputNumber: number | string): string {
  if (isNaN(Number(inputNumber))) {
    return String(inputNumber);
  }

  const numericInput = String(inputNumber);
  const parsedInput = parseFloat(numericInput);

  const eformat = parsedInput.toExponential(); // 转换为标准的科学计数法形式（字符串）
  const tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/); // 分离出小数值和指数值

  if (tmpArray) {
    const [, decimalPart = '', exponent] = tmpArray;
    const number = parsedInput.toFixed(Math.max(0, decimalPart.length - parseInt(exponent, 10)));
    return number;
  }

  return String(parsedInput);
}
