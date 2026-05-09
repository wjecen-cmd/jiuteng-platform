import { get, post } from '@/utils/request'

// ==================== 用户相关 ====================
export const userApi = {
  // 发送验证码
  sendCode: (phone: string) => post('/api/auth/send-code', { phone }),
  
  // 手机号登录
  loginByPhone: (phone: string, code: string) => 
    post('/api/auth/login/phone', { phone, code }),
  
  // 账号密码登录
  loginByAccount: (username: string, password: string) => 
    post('/api/auth/login', { username, password }),
  
  // 获取用户信息
  getUserInfo: () => get('/api/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data: any) => post('/api/user/update', data),
}

// ==================== 服务器监控 ====================
export const serverApi = {
  // 获取服务器列表
  getList: () => get('/api/servers'),
  
  // 添加服务器
  add: (data: { name: string; ip: string; provider?: string }) => 
    post('/api/servers', data),
  
  // 删除服务器
  delete: (id: string) => post(`/api/servers/${id}/delete`),
  
  // 获取服务器详情
  getDetail: (id: string) => get(`/api/servers/${id}`),
}

// ==================== 域名监控 ====================
export const domainApi = {
  // 获取域名列表
  getList: () => get('/api/domains'),
  
  // 添加域名
  add: (data: { domain: string }) => post('/api/domains', data),
  
  // 删除域名
  delete: (id: string) => post(`/api/domains/${id}/delete`),
}

// ==================== API 密钥 ====================
export const apiKeyApi = {
  // 获取密钥列表
  getList: () => get('/api/keys'),
  
  // 创建密钥
  create: (name: string) => post('/api/keys', { name }),
  
  // 删除密钥
  delete: (id: string) => post(`/api/keys/${id}/delete`),
}

// ==================== 订单相关 ====================
export const orderApi = {
  // 获取充值套餐
  getPackages: () => get('/api/packages'),
  
  // 创建订单
  create: (packageId: string, payMethod: string) => 
    post('/api/orders', { packageId, payMethod }),
  
  // 获取订单列表
  getList: (page = 1, size = 20) => 
    get('/api/orders', { page, size }),
  
  // 查询订单状态
  getStatus: (orderNo: string) => get(`/api/orders/${orderNo}`),
}

// ==================== AI 对话 ====================
export const chatApi = {
  // 发送消息
  send: (message: string, conversationId?: string) => 
    post('/api/chat/send', { message, conversationId }),
  
  // 获取对话历史
  getHistory: (conversationId: string) => 
    get(`/api/chat/history/${conversationId}`),
}