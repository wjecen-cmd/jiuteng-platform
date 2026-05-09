// types/index.ts

export interface User {
  id: string;
  phone: string;
  email: string;
  nickname: string;
  avatar?: string;
  balance: number;
  level: number;
}

export interface Order {
  id: string;
  orderNo: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  payMethod: 'alipay' | 'wechat' | 'bank_card' | 'balance';
  createdAt: Date;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  validityDays: number;
  features: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  key: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export interface Message {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  sshKey?: string;
  status: 'online' | 'offline' | 'maintenance';
  createdAt: Date;
  updatedAt?: Date;
}

export interface Domain {
  id: string;
  domainName: string;
  userId: string;
  serverId: string;
  sslEnabled: boolean;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'suspended';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
  timestamp: Date;
}
