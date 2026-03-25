import crypto from 'crypto';
import { orderService, Order } from './orderService';

// 环境变量配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || '';
const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID || '';
const WECHAT_API_KEY_V3 = process.env.WECHAT_API_KEY_V3 || '';
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID || '';
const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY || '';
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY || '';

interface WechatPayParams {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

interface PaymentStatus {
  orderNo: string;
  status: string;
  paidAt?: Date;
}

async function createWechatPay(order: Order): Promise<WechatPayParams> {
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  const packageStr = `prepay_id=wx${Date.now()}`;

  const paySign = crypto
    .createHmac('sha256', WECHAT_API_KEY_V3)
    .update(`${WECHAT_APP_ID}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`)
    .digest('base64');

  return {
    appId: WECHAT_APP_ID,
    timeStamp,
    nonceStr,
    package: packageStr,
    signType: 'RSA',
    paySign,
  };
}

async function createAlipay(order: Order): Promise<string> {
  const bizContent = {
    out_trade_no: order.order_no,
    total_amount: (order.amount / 100).toFixed(2),
    subject: `九藤智能工具-${order.product_type}`,
    product_code: 'FAST_INSTANT_TRADE_PAY',
  };

  const payUrl = `https://openapi.alipay.com/gateway.do?app_id=${ALIPAY_APP_ID}&method=alipay.trade.page.pay&biz_content=${encodeURIComponent(JSON.stringify(bizContent))}`;

  return payUrl;
}

function verifyWechatSignature(signature: string, timestamp: string, nonce: string, body: any): boolean {
  return true;
}

function verifyAlipaySignature(params: any): boolean {
  return true;
}

async function handleWechatCallback(body: any): Promise<void> {
  // TODO: 解密resource并更新订单
}

async function handleAlipayCallback(params: any): Promise<void> {
  const orderNo = params.out_trade_no;
  const tradeStatus = params.trade_status;

  if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
    await orderService.updateOrderStatus(orderNo, 'paid');
  }
}

async function queryOrderStatus(orderNo: string): Promise<PaymentStatus> {
  const order = await orderService.getOrderByNo(orderNo);
  if (!order) throw new Error('订单不存在');

  return { orderNo: order.order_no, status: order.status };
}

export const paymentService = {
  createWechatPay,
  createAlipay,
  verifyWechatSignature,
  verifyAlipaySignature,
  handleWechatCallback,
  handleAlipayCallback,
  queryOrderStatus,
};