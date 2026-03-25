# Mobile App - 手机客户端

## 技术方案

**Uni-app** - 一套代码，多端发布

### 为什么选 Uni-app？

| 特性 | Uni-app | React Native | Flutter |
|------|---------|--------------|---------|
| 学习成本 | 低 | 中 | 高 |
| 跨平台 | iOS + Android + 小程序 + H5 | iOS + Android | iOS + Android |
| 生态 | 丰富 | 丰富 | 中等 |
| 国内支持 | 强 | 中 | 中 |

### 技术栈

- **框架**: Uni-app (Vue 3)
- **UI**: Uni-ui / uView
- **状态管理**: Pinia
- **网络**: axios / uni.request

### 目录结构

```
mobile/
├── pages/            # 页面
├── components/       # 组件
├── api/              # API 接口
├── store/            # 状态管理
├── utils/            # 工具函数
├── static/           # 静态资源
├── App.vue
├── main.js
├── manifest.json     # 应用配置
├── pages.json        # 页面配置
└── uni.scss          # 全局样式
```

### 开发命令

```bash
# 安装依赖
npm install

# H5 开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# App 开发
npm run dev:app

# 构建
npm run build:h5
npm run build:app
```

### 支持平台

- ✅ iOS App
- ✅ Android App
- ✅ 微信小程序
- ✅ H5 网页

---

**状态**: 待开发