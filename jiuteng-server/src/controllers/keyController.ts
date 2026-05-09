import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { encrypt } from '../utils';

// 创建API密钥
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { key_name, rate_limit, daily_limit, expires_at } = req.body;

    // 参数验证
    if (!key_name) {
      return res.status(400).json({
        code: 400,
        message: '密钥名称不能为空'
      });
    }

    // 生成API密钥和密钥
    const apiKey = `jt_${uuidv4().replace(/-/g, '')}`;
    const secretKey = `jts_${uuidv4().replace(/-/g, '')}`;

    // 加密密钥
    const encryptedSecretKey = encrypt(secretKey);

    // 这里应该保存到数据库
    // const newApiKey = await ApiKey.create({
    //   user_id: userId,
    //   key_name,
    //   api_key: apiKey,
    //   encrypted_secret_key: encryptedSecretKey,
    //   rate_limit: rate_limit || 1000,
    //   daily_limit: daily_limit || 10000,
    //   expires_at: expires_at || null
    // });
    
    // 模拟创建结果
    const newApiKey = {
      id: 1,
      user_id: userId,
      key_name,
      api_key: apiKey,
      rate_limit: rate_limit || 1000,
      daily_limit: daily_limit || 10000,
      created_at: new Date()
    };

    return res.json({
      code: 0,
      message: 'API密钥创建成功',
      data: {
        api_key: newApiKey.api_key,
        secret_key: secretKey, // 返回原始密钥给用户，但数据库中存储加密版本
        key_info: {
          id: newApiKey.id,
          key_name: newApiKey.key_name,
          rate_limit: newApiKey.rate_limit,
          daily_limit: newApiKey.daily_limit,
          created_at: newApiKey.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 列出用户的API密钥
export const listApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { page = 1, limit = 10 } = req.query;

    // 这里应该从数据库查询用户的API密钥
    // const { count, rows } = await ApiKey.findAndCountAll({
    //   where: { user_id: userId },
    //   offset: (Number(page) - 1) * Number(limit),
    //   limit: Number(limit),
    //   order: [['created_at', 'DESC']]
    // });
    
    // 模拟查询结果
    const count = 2;
    const rows = [
      {
        id: 1,
        key_name: '主应用密钥',
        api_key: 'jt_a1b2c3d4e5f6...',
        status: 1,
        rate_limit: 1000,
        daily_limit: 10000,
        total_calls: 150,
        last_used_at: new Date(),
        created_at: new Date()
      },
      {
        id: 2,
        key_name: '备用密钥',
        api_key: 'jt_z9y8x7w6v5...',
        status: 1,
        rate_limit: 500,
        daily_limit: 5000,
        total_calls: 80,
        last_used_at: null,
        created_at: new Date(Date.now() - 86400000) // 一天前
      }
    ];

    return res.json({
      code: 0,
      message: '获取API密钥列表成功',
      data: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        keys: rows
      }
    });
  } catch (error) {
    console.error('List API keys error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 更新API密钥
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { key_name, status, rate_limit, daily_limit, expires_at } = req.body;

    // 这里应该更新数据库中的API密钥
    // const [updatedRowsCount] = await ApiKey.update(
    //   { 
    //     key_name, 
    //     status, 
    //     rate_limit, 
    //     daily_limit, 
    //     expires_at 
    //   },
    //   { where: { id: Number(id), user_id: userId } }
    // );
    
    // 模拟更新结果
    const updatedRowsCount = 1;

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在或无权限修改'
      });
    }

    return res.json({
      code: 0,
      message: 'API密钥更新成功',
      data: {}
    });
  } catch (error) {
    console.error('Update API key error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 删除API密钥
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // 这里应该从数据库删除API密钥
    // const deletedRowsCount = await ApiKey.destroy({
    //   where: { id: Number(id), user_id: userId }
    // });
    
    // 模拟删除结果
    const deletedRowsCount = 1;

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在或无权限删除'
      });
    }

    return res.json({
      code: 0,
      message: 'API密钥删除成功',
      data: {}
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};

// 获取API密钥使用情况
export const getApiKeyUsage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // 这里应该从数据库查询API密钥的使用情况
    // const apiKey = await ApiKey.findOne({
    //   where: { id: Number(id), user_id: userId },
    //   attributes: ['id', 'key_name', 'api_key', 'rate_limit', 'daily_limit', 'total_calls']
    // });
    
    // 模拟查询结果
    const apiKey = {
      id: Number(id),
      key_name: '主应用密钥',
      api_key: 'jt_a1b2c3d4e5f6...',
      rate_limit: 1000,
      daily_limit: 10000,
      total_calls: 150
    };

    if (!apiKey) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在'
      });
    }

    // 这里还可以查询更详细的使用统计信息
    // 比如今天已使用的调用次数等
    const todayUsage = 45; // 模拟今日使用量

    return res.json({
      code: 0,
      message: '获取API密钥使用情况成功',
      data: {
        key_info: apiKey,
        usage_stats: {
          today_usage: todayUsage,
          remaining_daily: apiKey.daily_limit - todayUsage,
          rate_limit_remaining: apiKey.rate_limit // 简化显示
        }
      }
    });
  } catch (error) {
    console.error('Get API key usage error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
};