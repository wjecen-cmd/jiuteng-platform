import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate verification code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// In-memory code storage (use Redis in production)
const codeStore = new Map<string, { code: string; expiresAt: number }>();

// POST /send-code - 发送验证码
router.post(
  '/send-code',
  [body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, errors: errors.array() });
    }

    const { phone } = req.body;
    const code = generateCode();
    
    // Store code (5 minutes expiry)
    codeStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
    
    // TODO: Send SMS via Aliyun/Tencent SMS service
    console.log(`[SMS] Code ${code} sent to ${phone}`);
    
    res.json({ code: 200, message: '验证码已发送', data: { code } });
  }
);

// POST /login/phone - 手机验证码登录
router.post(
  '/login/phone',
  [
    body('phone').isMobilePhone('zh-CN'),
    body('code').isLength({ min: 6, max: 6 })
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, errors: errors.array() });
    }

    const { phone, code } = req.body;
    // TODO: 验证码验证（临时绕过）
    // const stored = codeStore.get(phone);
    // if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
    //   return res.status(400).json({ code: 400, message: '验证码无效或已过期' });
    // }
    // codeStore.delete(phone);

    // Find or create user
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error?.code === 'PGRST116') {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ phone, created_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (createError) {
        return res.status(500).json({ code: 500, message: '创建用户失败' });
      }
      user = newUser;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: { token, user: { id: user.id, phone: user.phone } }
    });
  }
);

// POST /login - 账号密码登录
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Auth with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ code: 401, message: '邮箱或密码错误' });
    }

    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: { token, user: { id: data.user.id, email: data.user.email } }
    });
  }
);

export default router;