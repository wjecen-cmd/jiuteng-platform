import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

/**
 * 生成JWT Token
 * @param payload 要编码到token的数据
 * @returns 生成的token字符串
 */
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
};

/**
 * 验证JWT Token
 * @param token 待验证的token字符串
 * @returns 解码后的payload数据
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * 刷新JWT Token
 * @param token 当前的token
 * @returns 新的token
 */
export const refreshToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // 移除敏感信息，只保留必要的用户标识
    const payload = {
      userId: decoded.userId
    };
    return generateToken(payload);
  } catch (error) {
    throw new Error('Cannot refresh token');
  }
};