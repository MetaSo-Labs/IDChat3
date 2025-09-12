export function removeTrailingZeros(numberString) {
  // 将字符串转换为数字
  const number = parseFloat(numberString);
  // 将数字转换为字符串，并去掉多余的零
  const trimmedString = number.toString();
  return trimmedString;
}

export function removeTrailingZeros2(numberString, decimals: number) {
  let balance = parseFloat(numberString);
  const formattedNum = balance.toFixed(decimals);
  const showBalance = formattedNum.replace(/\.?0+$/, '');
  return showBalance;
}

export function isEmpty(value: any): boolean {
  // null 或 undefined
  if (value === null || value === undefined) return true;

  // 字符串
  if (typeof value === 'string') return value.trim().length === 0;

  // 数组
  if (Array.isArray(value)) return value.length === 0;

  // Map / Set
  if (value instanceof Map || value instanceof Set) return value.size === 0;

  // 对象（普通对象）
  if (typeof value === 'object') return Object.keys(value).length === 0;

  // number / boolean / function / symbol 等默认不算空
  return false;
}

export function isNotEmpty(value: any): boolean {
  return !isEmpty(value);
}
