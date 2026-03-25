import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 加载环境变量
config();

const router = Router();

// 创建 Supabase 客户端（使用 Service Role Key 绕过 RLS）
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 获取用户 API Keys
router.get('/api/user/api-keys', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jt_smart_secret') as any;
    
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取 API Keys 失败:', error);
      return res.status(500).json({ code: 500, message: '获取 API Keys 失败' });
    }
    
    res.json({ code: 200, data: apiKeys });
  } catch (error: any) {
    console.error('API Keys 接口错误:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 创建新的 API Key
router.post('/api/user/api-keys', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jt_smart_secret') as any;
    
    const { name = 'Default Key' } = req.body;
    
    // 生成随机 API Key
    const apiKey = `jt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: decoded.userId,
        name,
        key: apiKey,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) {
      console.error('创建 API Key 失败:', error);
      return res.status(500).json({ code: 500, message: '创建 API Key 失败' });
    }
    
    res.json({ code: 200, data: newKey });
  } catch (error: any) {
    console.error('创建 API Key 错误:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取用户订单
router.get('/api/user/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jt_smart_secret') as any;
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取订单失败:', error);
      return res.status(500).json({ code: 500, message: '获取订单失败' });
    }
    
    res.json({ code: 200, data: orders });
  } catch (error: any) {
    console.error('订单接口错误:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;