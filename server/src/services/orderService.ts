import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  product_type: string;
  product_id: string;
  amount: number;
  payment_method?: string;
  remark?: string;
  cancel_reason?: string;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderParams {
  user_id: string;
  product_type: string;
  product_id: string;
  payment_method: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  user_id?: string;
  status?: Order['status'];
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

function generateOrderNo(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JT${timestamp}${random}`;
}

async function getOrders(params: PaginationParams = {}): Promise<PaginationResult<Order>> {
  const { page = 1, limit = 10, user_id, status } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (user_id) query = query.eq('user_id', user_id);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data as Order[]) ?? [],
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  };
}

async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Order;
}

async function getOrderByNo(orderNo: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_no', orderNo)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Order;
}

async function createOrder(params: CreateOrderParams): Promise<Order> {
  const { user_id, product_type, product_id, payment_method } = params;

  const order_no = generateOrderNo();

  // TODO: 根据product_type和product_id查询价格
  const amount = 0;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_no,
      user_id,
      product_type,
      product_id,
      amount,
      payment_method,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

async function cancelOrder(id: string, userId: string): Promise<Order> {
  const order = await getOrderById(id);
  if (!order) throw new Error('订单不存在');
  if (order.user_id !== userId) throw new Error('无权操作此订单');

  if (order.status !== 'pending') {
    throw new Error('只能取消待支付订单');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

async function refundOrder(id: string, userId: string, reason: string): Promise<Order> {
  const order = await getOrderById(id);
  if (!order) throw new Error('订单不存在');
  if (order.user_id !== userId) throw new Error('无权操作此订单');

  if (!['paid', 'completed'].includes(order.status)) {
    throw new Error('当前状态不能申请退款');
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'refunded',
      refund_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

async function updateOrderStatus(orderNo: string, status: Order['status']): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('order_no', orderNo)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export const orderService = {
  generateOrderNo,
  getOrders,
  getOrderById,
  getOrderByNo,
  createOrder,
  cancelOrder,
  refundOrder,
  updateOrderStatus,
};