# JT.SMART Platform

> 提示词优化工具 - 多端应用

---

## 📱 项目结构

```
jiuteng-platform/
├── web/              # 网站前端 (Next.js)
├── server/           # 后端 API (Express + TypeScript)
├── database/         # 数据库 (PostgreSQL / Supabase)
├── desktop/          # 电脑客户端 (Tauri) - 待开发
├── mobile/           # 手机客户端 (Uni-app) - 待开发
└── shared/           # 多端共享代码 - 待开发
```

---

## 🌐 网站端 (Web)

**技术栈**: Next.js 16 + React 19 + Tailwind CSS 4

### 页面

| 路径 | 功能 | 状态 |
|------|------|------|
| `/login` | 登录页 | ✅ |
| `/chat` | AI 对话 | ✅ 框架 |
| `/agent` | Agent 管理 | ✅ 框架 |
| `/monitor` | 监控大屏 | ✅ 框架 |
| `/shop` | API 商城 | ✅ 框架 |
| `/workflow` | 工作流 | ✅ 框架 |

### 启动

```bash
cd web
npm install
npm run dev
```

---

## ⚙️ 后端 API (Server)

**技术栈**: Express + TypeScript + Supabase

### 接口

| 路径 | 说明 |
|------|------|
| POST /api/auth/login | 登录 |
| POST /api/chat/completions | AI 对话 |
| GET /api/user/profile | 用户信息 |

### 启动

```bash
cd server
npm install
npm run dev
```

---

## 🖥️ 电脑端 (Desktop)

**技术栈**: Tauri 2.0 + React

**状态**: 待开发

---

## 📲 手机端 (Mobile)

**技术栈**: Uni-app (Vue 3)

**支持平台**:
- iOS App
- Android App
- 微信小程序
- H5

**状态**: 待开发

---

## 🗄️ 数据库

**Supabase**: https://hidmcbxqjoecvzlumxiy.supabase.co

### 表结构

- users - 用户
- orders - 订单
- verification_codes - 验证码
- monitored_servers - 服务器监控
- monitored_domains - 域名监控

---

## 🔗 相关链接

| 资源 | 地址 |
|------|------|
| GitHub | https://github.com/wjecen-cmd/jiuteng-platform |
| 网站 | https://wjecen.vip |
| Supabase | https://supabase.com |

---

## 📝 开发进度

| 模块 | 进度 |
|------|------|
| 网站前端 | 60% |
| 后端 API | 40% |
| 电脑端 | 0% |
| 手机端 | 0% |

---

**最后更新**: 2026-03-25