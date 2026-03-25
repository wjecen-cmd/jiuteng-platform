// 简化版服务器 - 测试运行
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = 3001;  // 换端口

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: '九藤智能工具平台 API',
    version: '1.0.0',
    port: PORT
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API 正常运行',
    timestamp: new Date().toISOString()
  });
});

// 保持进程运行
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 测试: http://localhost:${PORT}/health`);
});

// 防止退出
setInterval(() => {}, 1000 * 60 * 60);