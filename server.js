/**
 * Express服务器入口文件
 * 
 * 用C语言思维理解：
 * - 类似C中的main()函数
 * - app.listen() 类似C中的服务器启动函数
 */

require('dotenv').config(); // 加载环境变量（类似C中的#include）
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// 导入路由（类似C中的函数声明）
const authRoutes = require('./routes/auth');
console.log('✅ authRoutes 加载成功:', authRoutes);
const contractRoutes = require('./routes/contract');
const evidenceRoutes = require('./routes/evidence');
const detectionRoutes = require('./routes/detection');
const complaintRoutes = require('./routes/complaint');
const voiceRoutes = require('./routes/voice');
const dashboardRoutes = require('./routes/dashboard');
const learningRoutes = require('./routes/learning');
// 创建Express应用（类似C中的初始化）
const app = express();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet()); // 设置HTTP安全头
app.use(compression()); // 压缩响应

app.use(cors({
  origin: true, // 自动匹配前端来源，解决 '*' 和 credentials 的冲突
  credentials: true
}));

// 请求限流（防止API滥用）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 最多100个请求
});
app.use('/api/', limiter);

// 解析JSON请求体（类似C中的读取输入）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API路由（类似C中的路由表）
app.use('/api/auth', authRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/learning', learningRoutes);

// 404处理（类似C中的默认case）
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器（类似C中的main函数）
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭（类似C中的信号处理）
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

