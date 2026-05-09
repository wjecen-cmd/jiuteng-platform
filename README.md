# 九藤智能工具平台

九藤智能工具平台是一个综合性的API服务平台，提供多种智能化工具和服务。

## 项目结构

```
jiuteng-platform/
├── database/
│   └── schema.sql           # 数据库表结构定义
└── jiuteng-server/          # Express + TypeScript 后端服务
    ├── src/
    │   ├── index.ts         # 应用入口
    │   ├── app.ts           # Express 应用配置
    │   ├── config/          # 配置文件
    │   ├── middleware/      # 中间件 (认证、限流、错误处理)
    │   ├── utils/           # 工具函数 (JWT、加密、日志)
    │   ├── routes/          # 路由定义
    │   ├── controllers/     # 控制器
    │   └── database/        # 数据库连接
    ├── package.json         # 项目依赖
    ├── tsconfig.json        # TypeScript 配置
    └── README.md            # 项目说明
```

## 数据库设计

项目包含10张核心表：

1. `users` - 用户表
2. `orders` - 订单表
3. `recharge_packages` - 充值套餐表
4. `api_keys` - API密钥表
5. `api_call_logs` - API调用日志表
6. `monitored_servers` - 服务器监控表
7. `monitored_domains` - 域名监控表
8. `usb_devices` - U盘绑定表
9. `verification_codes` - 验证码表
10. `audit_logs` - 操作审计表

## 技术栈

- **后端**: Node.js + Express + TypeScript
- **数据库**: MySQL (通过Sequelize ORM)
- **认证**: JWT Token 认证
- **安全**: Helmet, CORS, Rate Limiting
- **加密**: Bcrypt (密码), AES-256-CBC (敏感数据)

## API 返回格式

所有API接口遵循统一返回格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- `code`: 0 表示成功，非0表示错误
- `message`: 响应消息
- `data`: 具体响应数据

## 功能特性

1. **用户认证**: 支持手机号+密码登录，手机号+验证码登录
2. **API密钥管理**: 用户可创建、管理多个API密钥
3. **安全措施**: 
   - 密码加盐哈希存储
   - 敏感信息加密存储
   - 请求频率限制
   - JWT Token认证
4. **操作审计**: 记录关键操作日志
5. **扩展性**: 模块化设计，易于扩展

## 安装运行

1. 安装依赖:
```bash
npm install
```

2. 编译TypeScript:
```bash
npm run build
```

3. 启动服务:
```bash
npm start
```

## 环境变量

项目需要以下环境变量:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=jiuteng_platform
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_encryption_key
```