import { Request, Response } from 'express';
import { generateToken, hashPassword, generateSalt, comparePassword, generateVerificationCode } from '../utils';
import { sendSms } from '../utils/sms'; // 假设实现了短信发送功能

// 手机号登录
export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password, code } = req.body;

    // 参数验证
    if (!phone || (!password && !code)) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    // 这里应该从数据库查询用户
    // const user = await User.findOne({ where: { phone } });
    
    // 模拟用户数据
    const user = {
      id: 1,
      phone: phone,
      password_hash: '$2b$10$8K1p/aWq/QOcnZq6EJq4Ee0FQSZzN1.dLgSSwbu6EKYjL0JN.nd.C', // 模拟hash
      status: 1
    };

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    if (user.status === 0) {
      return res.status(403).json({
        code: 403,
        message: '账户已被禁用'
      });
    }

    let isValid = false;
    
    // 如果提供了密码，则验证密码
    if (password) {
      isValid = await comparePassword(password, user.password_hash);
    } 
    // 如果提供了验证码，则验证验证码（这里简化处理，实际应查询数据库中的验证码记录）
    else if (code) {
      // 验证码逻辑应该在这里实现，从数据库中获取并验证
      // 模拟验证成功
      isValid = code === '123456'; // 仅用于演示
    }

    if (!isValid) {
      return res.status(401).json({
        code: 401,
        message: '手机号或密码错误'
      });
    }

    // 生成JWT token
    const token = generateToken({ userId: user.id });

    // 更新最后登录时间（这里省略数据库更新）

    return res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    const { phone, password, code } = req.body;

    // 参数验证
    if (!phone || !password || !code) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数'
      });
    }

    // 验证码验证（这里简化处理）
    if (code !== '123456') { // 仅用于演示
      return res.status(400).json({
        code: 400,
        message: '验证码错误'
      });
    }

    // 检查手机号是否已存在
    // const existingUser = await User.findOne({ where: { phone } });
    const existingUser = null; // 模拟没有找到现有用户

    if (existingUser) {
      return res.status(409).json({
        code: 409,
        message: '手机号已注册'
      });
    }

    // 加密密码
    const salt = generateSalt();
    const passwordHash = await hashPassword(password);

    // 创建新用户
    // const newUser = await User.create({
    //   phone,
    //   password_hash: passwordHash,
    //   salt,
    //   nickname: `用户_${phone.slice(-4)}`
    // });
    
    // 模拟新用户
    const newUser = {
      id: 2,
      phone,
      nickname: `用户_${phone.slice(-4)}`
    };

    // 生成JWT token
    const token = generateToken({ userId: newUser.id });

    return res.json({
      code: 0,
      message: '注册成功',
      data: {
        token,
        user: {
          id: newUser.id,
          phone: newUser.phone,
          nickname: newUser.nickname
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 发送验证码
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { phone, type = 'login' } = req.body;

    // 参数验证
    if (!phone) {
      return res.status(400).json({
        code: 400,
        message: '手机号不能为空'
      });
    }

    // 生成验证码
    const code = generateVerificationCode(6);

    // 发送短信验证码
    // 在实际应用中，这里会调用短信服务商的API
    // await sendSms(phone, code);
    
    console.log(`验证码发送至 ${phone}: ${code}`); // 仅用于演示

    // 保存验证码到数据库（这里省略）
    // await VerificationCode.create({
    //   target: phone,
    //   code,
    //   type,
    //   expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5分钟后过期
    // });

    return res.json({
      code: 0,
      message: '验证码发送成功',
      data: {}
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};