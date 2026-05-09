import app from './app';
import { PORT } from './config';

const server = app.listen(PORT, () => {
  console.log(`九藤智能工具平台服务启动于端口 ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
  });
});

export default server;