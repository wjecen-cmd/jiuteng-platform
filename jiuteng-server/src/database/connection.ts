// src/database/connection.ts
// 数据库连接配置示例
// 这是数据库连接的示例代码，实际应用中可能需要根据所选ORM进行调整

import { Sequelize } from 'sequelize';
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '../config';

// 创建Sequelize实例
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql', // 根据实际使用的数据库类型调整
  logging: console.log, // 生产环境建议设置为false
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 测试数据库连接
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

// 同步数据库模型
export const syncDatabase = async () => {
  try {
    // 注意：force: true 会删除所有表并重新创建，生产环境请勿使用
    await sequelize.sync({ force: false });
    console.log('数据库同步完成');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

export default sequelize;