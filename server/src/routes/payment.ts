import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';

const router = Router();

// 支付回调不需要认证
router.use('/callback', (req, res, next) => next());

// POST /wechat - 微信支付
router.post(
  '/wechat',
  authMiddleware,
  [body('orderNo').notEmpty().isString().trim()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const { orderNo } = req.body;

    try {
      const order = await orderService.getOrderByNo(orderNo);
      if (!order || order.user_id !== userId) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }

      const payParams = await paymentService.createWechatPay(order);
      return res.json({ code: 200, data: payParams });
    } catch (err: any) {
      console.error('[POST /payment/wechat]', err);
      return res.status(500).json({ code: 500, message: err.message });
    }
  }
);

// POST /alipay - 支付宝支付
router.post(
  '/alipay',
  authMiddleware,
  [body('orderNo').notEmpty().isString().trim()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const { orderNo } = req.body;

    try {
      const order = await orderService.getOrderByNo(orderNo);
      if (!order || order.user_id !== userId) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }

      const payUrl = await paymentService.createAlipay(order);
      return res.json({ code: 200, data: { payUrl } });
    } catch (err: any) {
      console.error('[POST /payment/alipay]', err);
      return res.status(500).json({ code: 500, message: err.message });
    }
  }
);

// POST /callback/wechat - 微信支付回调
router.post('/callback/wechat', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['wechatpay-signature'] as string;
    const timestamp = req.headers['wechatpay-timestamp'] as string;
    const nonce = req.headers['wechatpay-nonce'] as string;

    if (!paymentService.verifyWechatSignature(signature, timestamp, nonce, req.body)) {
      return res.status(401).json({ code: 'FAIL', message: '签名验证失败' });
    }

    await paymentService.handleWechatCallback(req.body);
    return res.json({ code: 'SUCCESS', message: '成功' });
  } catch (err) {
    console.error('[POST /payment/callback/wechat]', err);
    return res.status(500).json({ code: 'FAIL', message: '服务器错误' });
  }
});

// POST /callback/alipay - 支付宝回调
router.post('/callback/alipay', async (req: Request, res: Response) => {
  try {
    if (!paymentService.verifyAlipaySignature(req.body)) {
      return res.send('fail');
    }

    await paymentService.handleAlipayCallback(req.body);
    return res.send('success');
  } catch (err) {
    console.error('[POST /payment/callback/alipay]', err);
    return res.send('fail');
  }
});

// GET /status/:orderNo - 查询支付状态
router.get(
  '/status/:orderNo',
  authMiddleware,
  [param('orderNo').notEmpty().isString().trim()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const orderNo = req.params.orderNo;

    try {
      const status = await paymentService.queryOrderStatus(orderNo);
      return res.json({ code: 200, data: status });
    } catch (err: any) {
      console.error('[GET /payment/status/:orderNo]', err);
      return res.status(500).json({ code: 500, message: err.message });
    }
  }
);

export default router;