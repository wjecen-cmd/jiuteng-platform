# 九藤智能工具平台

整合版本 - Web + Server + App

## 项目结构

```
jiuteng-platform-integrated/
├── web/          # Next.js Web 前端 (v0)
├── server/       # Express 后端 API (Claude Code)
├── app/          # Uni-app 跨端应用 (待开发)
└── database/     # 数据库设计
```

## 技术栈

### Web 前端
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI

### 后端
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL)
- JWT 认证

### App (计划中)
- Uni-app
- Vue 3
- 跨端编译

## 快速开始

### 1. 配置环境变量

```bash
cd server
cp .env.example .env
# 编辑 .env 填入 Supabase 配置
```

### 2. 安装依赖

```bash
# 后端
cd server
npm install

# 前端
cd ../web
npm install
```

### 3. 启动服务

```bash
# 后端 (端口 3000)
cd server
npm run dev

# 前端 (端口 3001)
cd web
npm run dev
```

## API 接口

| 路径 | 说明 |
|------|------|
| GET /health | 健康检查 |
| POST /api/auth/send-code | 发送验证码 |
| POST /api/auth/login/phone | 手机登录 |
| POST /api/auth/login | 账号登录 |
| POST /api/chat/completions | AI 对话 |
| GET /api/orders | 订单列表 |
| POST /api/payment/wechat | 微信支付 |

## 开发进度

- [x] v0 UI 设计
- [x] 后端路由结构
- [ ] 数据库迁移
- [ ] 前后端联调
- [ ] Uni-app 开发

## 部署

- Web: Vercel / 云服务器
- API: 云服务器
- 数据库: Supabase