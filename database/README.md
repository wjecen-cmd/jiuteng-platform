# 九藤智能工具平台 - 数据库设计说明

## 📊 表结构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户系统                                 │
│  users (用户表)                                               │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      支付系统                                 │
│  recharge_packages (充值套餐)                                 │
│  orders (订单表)                                              │
│  payment_callbacks (支付回调日志)                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 服务系统                               │
│  api_keys (API 密钥)                                          │
│  api_call_logs (调用日志)                                     │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      监测系统                                 │
│  monitored_servers (服务器监控)                               │
│  monitored_domains (域名监控)                                 │
│  monitored_projects (项目监控)                                │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────┐
│                     U盘设备系统                               │
│  usb_devices (设备绑定)                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      辅助系统                                 │
│  verification_codes (验证码)                                  │
│  audit_logs (操作审计)                                        │
│  system_configs (系统配置)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 表详解

### 1. users（用户表）

存储所有用户信息，支持三种登录方式。

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 主键，自动生成 |
| phone | VARCHAR(20) | 手机号，唯一 |
| email | VARCHAR(255) | 邮箱，谷歌登录用 |
| wechat_openid | VARCHAR(100) | 微信 OpenID |
| google_id | VARCHAR(100) | 谷歌用户 ID |
| nickname | VARCHAR(50) | 昵称 |
| avatar_url | TEXT | 头像地址 |
| balance | DECIMAL(10,2) | 余额（元） |
| level | INT | 等级（1-10） |
| experience | INT | 经验值 |
| usb_serial | VARCHAR(50) | 绑定的 U 盘序号 |
| status | VARCHAR(20) | 状态：active/banned/deleted |

---

### 2. orders（订单表）

所有充值、支付记录。

| 字段 | 类型 | 说明 |
|-----|------|------|
| order_no | VARCHAR(50) | 业务订单号 |
| user_id | UUID | 用户 ID |
| amount | DECIMAL(10,2) | 支付金额 |
| credits | DECIMAL(10,2) | 获得余额 |
| bonus | DECIMAL(10,2) | 赠送金额 |
| pay_method | VARCHAR(20) | 支付方式 |
| transaction_id | VARCHAR(100) | 第三方交易号 |
| status | VARCHAR(20) | pending/paid/failed/refunded |

**支付方式枚举：**
- `wechat` — 微信支付
- `alipay` — 支付宝
- `bankcard` — 银行卡
- `stripe` — Stripe（国际卡）

---

### 3. api_keys（API 密钥表）

用户创建的 API 密钥，用于调用 AI 服务。

| 字段 | 类型 | 说明 |
|-----|------|------|
| key_hash | VARCHAR(255) | 密钥哈希（加密存储） |
| key_prefix | VARCHAR(10) | 前缀（如 jt_abc...） |
| name | VARCHAR(50) | 密钥名称 |
| permissions | JSONB | 权限配置 |
| rate_limit | INT | 每分钟请求限制 |
| is_active | BOOLEAN | 是否启用 |

---

### 4. api_call_logs（调用日志表）

每次 API 调用的详细记录，用于计费和统计。

| 字段 | 类型 | 说明 |
|-----|------|------|
| user_id | UUID | 用户 ID |
| model | VARCHAR(100) | 模型名称（gpt-4、claude-3） |
| input_tokens | INT | 输入 token 数 |
| output_tokens | INT | 输出 token 数 |
| cost | DECIMAL(10,6) | 本次费用 |
| latency_ms | INT | 响应时间（毫秒） |

---

### 5. monitored_servers（服务器监控）

| 字段 | 类型 | 说明 |
|-----|------|------|
| name | VARCHAR(100) | 服务器名称 |
| ip_address | VARCHAR(50) | IP 地址 |
| provider | VARCHAR(50) | 云厂商（aliyun/tencent/aws） |
| expiry_date | DATE | 到期日期 |
| remind_days | INT | 提前几天提醒 |

---

### 6. monitored_domains（域名监控）

| 字段 | 类型 | 说明 |
|-----|------|------|
| domain | VARCHAR(255) | 域名 |
| registrar | VARCHAR(100) | 注册商 |
| ssl_status | VARCHAR(20) | SSL 状态 |
| expiry_date | DATE | 到期日期 |

---

### 7. usb_devices（U盘设备）

| 字段 | 类型 | 说明 |
|-----|------|------|
| serial_number | VARCHAR(50) | 设备序号 |
| user_id | UUID | 绑定用户 |
| license_type | VARCHAR(20) | 授权类型 |
| license_expires_at | TIMESTAMPTZ | 授权到期时间 |

---

## 💡 设计要点

### 1. 安全性
- API 密钥加密存储（key_hash）
- RLS（Row Level Security）确保用户只能访问自己的数据
- 敏感操作记录审计日志

### 2. 可扩展性
- JSONB 字段存储灵活配置（permissions、details）
- 预留索引，方便后续优化查询

### 3. 可维护性
- 自动更新 updated_at 触发器
- 软删除（status 字段）而非硬删除

---

## 🚀 如何使用

### 在 Supabase 中执行

1. 打开 Supabase 控制台
2. 进入 SQL Editor
3. 复制 `schema.sql` 内容
4. 点击 Run 执行

### 初始数据

执行后会自动插入：
- 4 个充值套餐（体验版、基础版、专业版、企业版）
- 系统配置项（API 地址、支付密钥占位）

---

## 📐 ER 图（简化版）

```
users
  ├── 1:N ── orders
  ├── 1:N ── api_keys
  │             └── 1:N ── api_call_logs
  ├── 1:N ── monitored_servers
  ├── 1:N ── monitored_domains
  ├── 1:N ── monitored_projects
  └── 1:1 ── usb_devices
```

---

## ❓ 常见问题

**Q: 为什么用 UUID 而不是自增 ID？**
A: UUID 更安全（不可猜测）、分布式友好、方便迁移。

**Q: 为什么用 PostgreSQL？**
A: Supabase 基于 PostgreSQL，免费、稳定、支持 JSONB、RLS。

**Q: 如何处理大量日志？**
A: api_call_logs 可定期归档到冷存储，或使用 TimescaleDB 扩展。

---

设计完成。有问题随时问。