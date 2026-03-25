// src/types/order.ts

import { Request } from 'express';

// ─── OrderStatus 枚举 ────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// ─── 子类型 ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ─── Order 接口 ──────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  status: OrderStatus;
  productType: string;
  productId: string;
  amount: number;
  paymentMethod?: string;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── CreateOrderDTO ──────────────────────────────────────────────────────────

export interface CreateOrderDTO {
  productType: string;
  productId: string;
  paymentMethod: string;
}

// ─── Express 扩展类型 ─────────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface OrderRequestParams {
  id?: string;
}

export interface OrderQueryParams {
  status?: OrderStatus;
  page?: string;
  limit?: string;
}

export interface OrderRequest<
  P = OrderRequestParams,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = OrderQueryParams,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthenticatedUser;
}

export type CreateOrderRequest = OrderRequest<Record<string, never>, unknown, CreateOrderDTO>;
export type GetOrderRequest = OrderRequest<OrderRequestParams>;
export type ListOrderRequest = OrderRequest<Record<string, never>>;

// ─── 分页响应 ────────────────────────────────────────────────────────────────

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}