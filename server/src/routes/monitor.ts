import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const router = Router();
router.use(authMiddleware);

// GET /servers
router.get('/servers', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase.from('servers').select('*').eq('user_id', userId);
    if (error) throw error;
    res.json({ code: 200, data });
  } catch (err) { res.status(500).json({ code: 500, message: '查询失败' }); }
});

// POST /servers
router.post('/servers', [body('server_name').notEmpty(), body('server_ip').notEmpty()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ code: 400, errors: errors.array() });
  try {
    const userId = req.user!.id;
    const { server_name, server_ip, provider, expire_date } = req.body;
    const { data, error } = await supabase.from('servers').insert({ user_id: userId, server_name, server_ip, provider, expire_date }).select().single();
    if (error) throw error;
    res.status(201).json({ code: 201, data });
  } catch (err) { res.status(500).json({ code: 500, message: '添加失败' }); }
});

// DELETE /servers/:id
router.delete('/servers/:id', [param('id').isUUID()], async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('servers').delete().eq('id', req.params.id).eq('user_id', req.user!.id);
    if (error) throw error;
    res.json({ code: 200, message: '删除成功' });
  } catch (err) { res.status(500).json({ code: 500, message: '删除失败' }); }
});

// GET /domains
router.get('/domains', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('domains').select('*').eq('user_id', req.user!.id);
    if (error) throw error;
    res.json({ code: 200, data });
  } catch (err) { res.status(500).json({ code: 500, message: '查询失败' }); }
});

// POST /domains
router.post('/domains', [body('domain_name').notEmpty()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ code: 400, errors: errors.array() });
  try {
    const { domain_name, expire_date, registrar } = req.body;
    const { data, error } = await supabase.from('domains').insert({ user_id: req.user!.id, domain_name, expire_date, registrar }).select().single();
    if (error) throw error;
    res.status(201).json({ code: 201, data });
  } catch (err) { res.status(500).json({ code: 500, message: '添加失败' }); }
});

// DELETE /domains/:id
router.delete('/domains/:id', [param('id').isUUID()], async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('domains').delete().eq('id', req.params.id).eq('user_id', req.user!.id);
    if (error) throw error;
    res.json({ code: 200, message: '删除成功' });
  } catch (err) { res.status(500).json({ code: 500, message: '删除失败' }); }
});

// GET /dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [servers, domains] = await Promise.all([
      supabase.from('servers').select('*').eq('user_id', req.user!.id),
      supabase.from('domains').select('*').eq('user_id', req.user!.id),
    ]);
    res.json({ code: 200, data: { servers: { total: servers.data?.length || 0 }, domains: { total: domains.data?.length || 0 } } });
  } catch (err) { res.status(500).json({ code: 500, message: '查询失败' }); }
});

export default router;