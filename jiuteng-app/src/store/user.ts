以下是使用 Pinia 创建用户 Store 的完整实现：

## 1. 首先安装依赖

```bash
npm install pinia @pinia/plugin-persistedstate
```

## 2. 定义 TypeScript 类型

// types/user.ts
export interface UserInfo {
  id?: string | number;
  username?: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  balance?: number;
  [key: string]: any; // 支持其他扩展字段
}

export interface LoginParams {
  username: string;
  password: string;
  [key: string]: any;
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
  [key: string]: any;
}
```

## 3. API 接口定义

// api/user.ts
import { LoginParams, LoginResponse, UserInfo } from '@/types/user';

// 模拟登录接口
export const loginApi = (params: LoginParams): Promise<LoginResponse> => {
  return new Promise((resolve) => {
    // 这里替换为实际的API调用
    setTimeout(() => {
      resolve({
        token: 'mock-token-' + Date.now(),
        userInfo: {
          id: 1,
          username: params.username,
          nickname: params.username,
          avatar: '',
          phone: '',
          email: ''
        }
      });
    }, 1000);
  });
};

// 获取用户信息接口
export const getUserInfoApi = (): Promise<UserInfo> => {
  return new Promise((resolve) => {
    // 这里替换为实际的API调用
    setTimeout(() => {
      resolve({
        id: 1,
        username: 'testuser',
        nickname: '测试用户',
        avatar: '',
        phone: '13800138000',
        email: 'test@example.com'
      });
    }, 500);
  });
};
```

## 4. Pinia Store 实现

// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserInfo } from '@/types/user';
import { loginApi, getUserInfoApi } from '@/api/user';

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo | null>(null);
  const token = ref<string | null>(null);
  const isLoggedIn = ref<boolean>(false);

  // Getters
  const getUserInfo = computed(() => userInfo.value);
  const getToken = computed(() => token.value);
  const getIsLoggedIn = computed(() => isLoggedIn.value);

  // Actions
  const login = async (username: string, password: string) => {
    try {
      const response = await loginApi({ username, password });
      
      // 更新状态
      token.value = response.token;
      userInfo.value = response.userInfo;
      isLoggedIn.value = true;

      // 持久化存储 token
      uni.setStorageSync('token', response.token);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // 清除状态
    userInfo.value = null;
    token.value = null;
    isLoggedIn.value = false;

    // 清除本地存储
    uni.removeStorageSync('token');
  };

  const updateUserInfo = (newUserInfo: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...newUserInfo };
    } else {
      userInfo.value = { ...newUserInfo } as UserInfo;
    }
  };

  const updateBalance = (balance: number) => {
    if (userInfo.value) {
      userInfo.value.balance = balance;
    }
  };

  // 初始化方法 - 从本地存储恢复 token
  const initFromStorage = () => {
    const storedToken = uni.getStorageSync('token');
    if (storedToken) {
      token.value = storedToken;
      isLoggedIn.value = true;
    }
  };

  // 自动获取用户信息（如果已登录）
  const fetchUserInfo = async () => {
    if (token.value && !userInfo.value) {
      try {
        const data = await getUserInfoApi();
        userInfo.value = data;
        isLoggedIn.value = true;
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 如果获取失败，可能需要重新登录
        logout();
      }
    }
  };

  return {
    // State
    userInfo,
    token,
    isLoggedIn,

    // Getters
    getUserInfo,
    getToken,
    getIsLoggedIn,

    // Actions
    login,
    logout,
    updateUserInfo,
    updateBalance,
    initFromStorage,
    fetchUserInfo
  };
});
```

## 5. 在 main.ts 中配置 Pinia

// main.ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  
  // 使用持久化插件
  pinia.use(piniaPluginPersistedstate);
  
  app.use(pinia);

  return {
    app
  };
}
```

## 6. 使用示例

// 在组件中使用
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  // 初始化时从本地存储恢复状态
  userStore.initFromStorage();
});

const handleLogin = async () => {
  try {
    await userStore.login('username', 'password');
    console.log('登录成功', userStore.getUserInfo);
  } catch (error) {
    console.error('登录失败', error);
  }
};

const handleLogout = () => {
  userStore.logout();
};

const updateBalance = () => {
  userStore.updateBalance(1000);
};
</script>
```

## 主要特性说明：

1. **TypeScript 支持**：完整的类型定义和类型检查
2. **状态管理**：包含用户信息、token 和登录状态
3. **API 集成**：集成登录和获取用户信息的 API
4. **本地存储**：自动将 token 存储到 `uni.setStorageSync`
5. **响应式计算属性**：通过 computed 提供 getter
6. **错误处理**：在 action 中包含适当的错误处理
7. **初始化逻辑**：从本地存储恢复状态的功能

这个实现提供了完整的用户状态管理功能，符合您的所有要求。