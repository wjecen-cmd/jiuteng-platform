import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler, authMiddleware } from './middleware';
import { authRoutes, userRoutes, keyRoutes } from './routes';

const app: Application = express();

// 安全中间件
app.use(helmet());
app.use(cors());

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 压缩中间件
app.use(compression());

// 全局速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  }
});
app.use(limiter);

// 路由
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    code: 0, 
    message: '九藤智能工具平台 API 接口', 
    data: { version: '1.0.0' } 
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/keys', authMiddleware, keyRoutes);

// 错误处理中间件
app.use(errorHandler);

export default app;