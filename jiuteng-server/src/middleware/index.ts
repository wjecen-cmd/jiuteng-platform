import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { verifyToken } from '../utils/jwt';

interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供访问令牌'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '无效的访问令牌'
    });
  }
};

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 这里可以实现自定义速率限制逻辑
  next();
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
};