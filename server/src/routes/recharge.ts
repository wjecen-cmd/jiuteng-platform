import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET /packages - 套餐列表
router.get('/packages', async (req: Request, res: Response) => {
  try {
    const packages = [
      { id: 1, name: '基础包', amount: 10, credits: 100, bonus: 0 },
      { id: 2, name: '标准包', amount: 50, credits: 550, bonus: 50 },
      { id: 3, name: '高级包', amount: 100, credits: 1200, bonus: 200 },
      { id: 4, name: '企业包', amount: 500, credits: 7000, bonus: 2000 },
    ];
    res.json({ code: 200, data: packages });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取套餐列表失败' });
  }
});

// POST / - 创建充值订单
router.post(
  '/',
  authMiddleware,
  [
    body('packageId').isInt({ min: 1 }),
    body('paymentMethod').isIn(['alipay', 'wechat']),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, errors: errors.array() });
    }

    try {
      const { packageId, paymentMethod } = req.body;
      const userId = req.user!.id;

      // TODO: 查询套餐 & 调用支付网关
      const order = {
        orderId: `RCH${Date.now()}`,
        userId,
        packageId,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      res.status(201).json({ code: 201, data: order });
    } catch (err) {
      res.status(500).json({ code: 500, message: '创建充值订单失败' });
    }
  }
);

// GET /balance - 查询余额
router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // TODO: 从数据库查询
    const balance = {
      userId,
      credits: 1250,
      updatedAt: new Date().toISOString(),
    };

    res.json({ code: 200, data: balance });
  } catch (err) {
    res.status(500).json({ code: 500, message: '查询余额失败' });
  }
});

// GET /history - 充值记录
router.get(
  '/history',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, errors: errors.array() });
    }

    try {
      const userId = req.user!.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      // TODO: 从数据库分页查询
      const records: any[] = [];

      res.json({
        code: 200,
        data: {
          list: records,
          pagination: { page, limit, total: 0 },
        },
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: '查询充值记录失败' });
    }
  }
);

export default router;