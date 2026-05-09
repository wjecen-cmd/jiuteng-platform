// src/utils/sms.ts
// 短信发送功能的模拟实现
// 在实际部署时，需要替换为真实的短信服务提供商API

interface SmsConfig {
  apiKey?: string;
  templateId?: string;
}

let smsConfig: SmsConfig = {};

/**
 * 初始化短信服务配置
 */
export const initSmsService = (config: SmsConfig) => {
  smsConfig = config;
};

/**
 * 发送短信验证码
 * @param phoneNumber 接收短信的手机号
 * @param code 验证码
 * @returns Promise<boolean> 发送是否成功
 */
export const sendSms = async (phoneNumber: string, code: string): Promise<boolean> => {
  // 在实际应用中，这里会调用短信服务商的API
  // 例如阿里云、腾讯云、或第三方短信服务
  
  console.log(`[SMS SERVICE] 向 ${phoneNumber} 发送验证码: ${code}`);
  
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟发送结果
  // 在真实环境中，这里会根据API返回结果决定成功或失败
  const isSuccess = Math.random() > 0.1; // 90% 成功率模拟
  
  if (isSuccess) {
    console.log(`[SMS SERVICE] 验证码发送成功`);
    return true;
  } else {
    console.error(`[SMS SERVICE] 验证码发送失败`);
    return false;
  }
};

/**
 * 发送通知类短信
 * @param phoneNumber 接收短信的手机号
 * @param message 短信内容
 * @returns Promise<boolean> 发送是否成功
 */
export const sendNotificationSms = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`[SMS SERVICE] 向 ${phoneNumber} 发送通知: ${message}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟发送结果
  const isSuccess = Math.random() > 0.1; // 90% 成功率模拟
  
  if (isSuccess) {
    console.log(`[SMS SERVICE] 通知发送成功`);
    return true;
  } else {
    console.error(`[SMS SERVICE] 通知发送失败`);
    return false;
  }
};