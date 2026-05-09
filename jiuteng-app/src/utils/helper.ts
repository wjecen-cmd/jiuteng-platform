// utils/helper.ts

/**
 * 格式化时间为 HH:mm 格式
 * @param date - Date 对象或时间戳
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date - Date 对象或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化金额，添加千分位分隔符
 * @param amount - 金额数值
 * @returns 格式化后的金额字符串
 */
export function formatMoney(amount: number | string): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount) || 0;
  }
  
  // 使用 toLocaleString 方法进行千分位格式化
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * 生成订单号（示例实现）
 * @returns 订单号字符串
 */
export function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD${timestamp}${randomNum}`;
}

/**
 * 隐藏手机号中间四位
 * @param phone - 手机号码
 * @returns 隐藏后的手机号码
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
