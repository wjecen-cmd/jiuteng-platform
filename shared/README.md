# Shared - 共享代码

多端共享的类型、API 和工具函数。

## 目录结构

```
shared/
├── types/            # TypeScript 类型定义
│   ├── user.ts
│   ├── order.ts
│   └── index.ts
├── api/              # API 调用封装
│   ├── client.ts
│   ├── auth.ts
│   └── index.ts
└── utils/            # 工具函数
    ├── format.ts
    ├── validate.ts
    └── index.ts
```

## 使用方式

### Web 端

```typescript
import { User, login } from '../shared/types/user';
import { apiClient } from '../shared/api/client';
```

### Mobile 端

```typescript
import { User } from '../shared/types/user';
import { formatPrice } from '../shared/utils/format';
```

### Desktop 端

```typescript
import { apiClient } from '../shared/api/client';
import { validatePhone } from '../shared/utils/validate';
```

---

**状态**: 待开发