# Desktop App - 电脑客户端

## 技术方案

**Tauri** - 轻量级跨平台桌面应用框架

### 为什么选 Tauri？

| 特性 | Tauri | Electron |
|------|-------|----------|
| 安装包大小 | ~3MB | ~50MB |
| 内存占用 | 低 | 高 |
| 底层语言 | Rust | JavaScript |
| 安全性 | 高 | 中 |

### 技术栈

- **框架**: Tauri 2.0
- **前端**: React / Vue / Svelte
- **后端**: Rust
- **打包**: 支持 Windows / macOS / Linux

### 目录结构

```
desktop/
├── src/              # 前端代码
├── src-tauri/        # Rust 后端
└── README.md
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建
npm run tauri build
```

---

**状态**: 待开发