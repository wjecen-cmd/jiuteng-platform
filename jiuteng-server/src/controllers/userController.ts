import { Request, Response } from 'express';

// 获取用户信息
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    // 从中间件中获取用户ID
    const userId = (req as any).userId;

    // 这里应该从数据库查询用户信息
    // const user = await User.findByPk(userId, { attributes: { exclude: ['password_hash', 'salt'] } });
    
    // 模拟用户数据
    const user = {
      id: userId,
      phone: '138****8888',
      nickname: '测试用户',
      email: 'test@example.com',
      avatar_url: '',
      balance: 100.50,
      created_at: new Date()
    };

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    return res.json({
      code: 0,
      message: '获取用户信息成功',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 更新用户资料
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { nickname, email, avatar_url } = req.body;

    // 参数验证
    if (!nickname) {
      return res.status(400).json({
        code: 400,
        message: '昵称不能为空'
      });
    }

    // 这里应该更新数据库中的用户信息
    // const [updatedRowsCount] = await User.update(
    //   { nickname, email, avatar_url },
    //   { where: { id: userId } }
    // );
    
    // 模拟更新结果
    const updatedRowsCount = 1;

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    return res.json({
      code: 0,
      message: '更新用户资料成功',
      data: {}
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 获取用户余额
export const getUserBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 这里应该从数据库查询用户余额
    // const user = await User.findByPk(userId, { attributes: ['balance'] });
    
    // 模拟用户余额
    const user = {
      balance: 100.50
    };

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    return res.json({
      code: 0,
      message: '获取余额成功',
      data: {
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Get user balance error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};