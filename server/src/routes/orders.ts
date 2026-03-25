import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';
import { orderService } from '../services/orderService';

const router = Router();

router.use(authMiddleware);

// GET / - 获取订单列表
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['pending', 'paid', 'completed', 'cancelled', 'refunded']),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;

    try {
      const result = await orderService.getOrders({
        page,
        limit,
        user_id: userId,
        status: status as any,
      });

      return res.json({
        code: 200,
        data: result,
      });
    } catch (err) {
      console.error('[GET /orders]', err);
      return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
);

// GET /:id - 获取订单详情
router.get(
  '/:id',
  [param('id').isUUID()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const orderId = req.params.id;

    try {
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }

      if (order.user_id !== userId) {
        return res.status(403).json({ code: 403, message: '无权访问此订单' });
      }

      return res.json({ code: 200, data: order });
    } catch (err) {
      console.error('[GET /orders/:id]', err);
      return res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
);

// POST / - 创建订单
router.post(
  '/',
  [
    body('product_type').notEmpty().isString().trim(),
    body('product_id').notEmpty().isString().trim(),
    body('payment_method').notEmpty().isString().trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const { product_type, product_id, payment_method } = req.body;

    try {
      const order = await orderService.createOrder({
        user_id: userId,
        product_type,
        product_id,
        payment_method,
      });

      return res.status(201).json({
        code: 201,
        message: '订单创建成功',
        data: order,
      });
    } catch (err: any) {
      console.error('[POST /orders]', err);
      return res.status(500).json({ code: 500, message: err.message || '服务器内部错误' });
    }
  }
);

// POST /:id/cancel - 取消订单
router.post(
  '/:id/cancel',
  [param('id').isUUID()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const orderId = req.params.id;

    try {
      const order = await orderService.cancelOrder(orderId, userId);

      return res.json({
        code: 200,
        message: '订单已取消',
        data: order,
      });
    } catch (err: any) {
      console.error('[POST /orders/:id/cancel]', err);
      return res.status(400).json({ code: 400, message: err.message });
    }
  }
);

// POST /:id/refund - 申请退款
router.post(
  '/:id/refund',
  [
    param('id').isUUID(),
    body('reason').notEmpty().isString().isLength({ min: 2, max: 500 }).trim(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: '参数错误', errors: errors.array() });
    }

    const userId = req.user!.id;
    const orderId = req.params.id;
    const { reason } = req.body;

    try {
      const order = await orderService.refundOrder(orderId, userId, reason);

      return res.status(201).json({
        code: 201,
        message: '退款申请已提交',
        data: order,
      });
    } catch (err: any) {
      console.error('[POST /orders/:id/refund]', err);
      return res.status(400).json({ code: 400, message: err.message });
    }
  }
);

export default router;