/**
 * MongoDB数据库连接配置
 * 
 * 用C语言思维理解：
 * - mongoose.connect() 类似C中的数据库连接函数
 * - 返回一个Promise，类似C中的异步操作回调
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB连接失败: ${error.message}`);
    process.exit(1); // 类似C中的exit(1)
  }
};

module.exports = connectDB;
