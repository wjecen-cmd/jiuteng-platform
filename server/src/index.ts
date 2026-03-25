import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'JT.SMART API',
    version: '1.0.0'
  });
});

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ code: 400, message: '请提供手机号' });
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { error } = await supabase
      .from('verification_codes')
      .insert([{
        target: phone,
        code: code,
        type: 'login',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }]);
    
    if (error) throw error;
    
    console.log(`[SMS] 验证码 ${code} -> ${phone}`);
    res.json({ code: 200, message: '验证码已发送' });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 手机登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ code: 400, message: '请提供手机号和验证码' });
    }
    
    // TODO: 验证码验证（临时绕过测试）
    // const { data: codes, error: codeError } = await supabase
    //   .from('verification_codes')
    //   .select('*')
    //   .eq('target', phone)
    //   .eq('code', code)
    //   .eq('status', 0)
    //   .gt('expires_at', new Date().toISOString())
    //   .order('created_at', { ascending: false })
    //   .limit(1);
    
    // if (codeError || !codes || codes.length === 0) {
    //   return res.status(400).json({ code: 400, message: '验证码无效或已过期' });
    // }
    
    // await supabase
    //   .from('verification_codes')
    //   .update({ status: 1, used_at: new Date().toISOString() })
    //   .eq('id', codes[0].id);
    
    let { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .limit(1);
    
    let user = users && users[0];
    
    if (!user) {
      const { data: newUsers, error: createError } = await supabase
        .from('users')
        .insert([{ phone }])
        .select();
      
      if (createError) throw createError;
      user = newUsers![0];
    }
    
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'jt_smart_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取用户信息
app.get('/api/user/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: '未登录' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jt_smart_secret') as any;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();
    
    res.json({ code: 200, data: user });
  } catch (error: any) {
    res.status(401).json({ code: 401, message: 'token无效' });
  }
});

// AI 对话接口 - 阿里云百炼 qwen3-max
app.post('/api/chat/completions', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ code: 400, message: '请提供消息内容' });
    }
    
    // 阿里云百炼 API
    const apiKey = process.env.QWEN_API_KEY || 'sk-11529863044b40f2a6c7962c645e4179';
    const apiBase = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = 'qwen3-max';
    
    console.log(`[AI] 调用 ${model}，消息数: ${messages.length}`);
    
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('AI API Error:', error);
      return res.status(500).json({ code: 500, message: 'AI服务暂时不可用' });
    }
    
    const data = await response.json();
    console.log(`[AI] 响应成功，ID: ${data.id}`);
    res.json({ code: 200, data });
  } catch (error: any) {
    console.error('Chat Error:', error);
    res.status(500).json({ code: 500, message: error.message });
  }
});

// 获取用户 API Keys
app.get('/api/user/api-keys', async (req, res) => {
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
app.post('/api/user/api-keys', async (req, res) => {
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
app.get('/api/user/orders', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 JT.SMART API 运行在 http://localhost:${PORT}`);
  console.log(`🤖 AI模型: qwen3-max (阿里云百炼)`);
});