import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// 模型列表
const MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', price: 0.001 },
  { id: 'gpt-4', name: 'GPT-4', price: 0.03 },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet', price: 0.015 },
  { id: 'glm-5', name: 'GLM-5', price: 0.001 },
];

// POST /completions - AI对话（SSE流式）
router.post(
  '/completions',
  [
    body('messages').isArray({ min: 1 }),
    body('model').optional().isString(),
    body('stream').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, errors: errors.array() });
    }

    const { messages, model = 'gpt-3.5-turbo', stream = true } = req.body;
    const userId = req.user!.id;

    try {
      // TODO: 检查用户余额

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // TODO: 调用AI API并流式返回
        const response = `这是AI的回复。您选择了模型: ${model}`;
        
        // 模拟SSE流式返回
        const chunks = response.split('');
        for (const chunk of chunks) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        // 非流式返回
        const response = { content: `这是AI的回复。您选择了模型: ${model}` };
        res.json({ code: 200, data: response });
      }
    } catch (err) {
      console.error('[POST /chat/completions]', err);
      res.status(500).json({ code: 500, message: 'AI服务异常' });
    }
  }
);

// GET /models - 获取模型列表
router.get('/models', async (req: Request, res: Response) => {
  try {
    res.json({ code: 200, data: MODELS });
  } catch (err) {
    res.status(500).json({ code: 500, message: '查询失败' });
  }
});

// GET /history - 对话历史
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    // TODO: 从数据库查询对话历史
    const history: any[] = [];
    res.json({ code: 200, data: history });
  } catch (err) {
    res.status(500).json({ code: 500, message: '查询失败' });
  }
});

export default router;