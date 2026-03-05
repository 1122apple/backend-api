/**
 * 错误处理中间件
 * 
 * 用C语言思维理解：
 * - 类似C中的错误处理宏或函数
 * - 统一处理所有错误，避免重复代码
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 日志记录错误（类似C中的日志函数）
  console.error('错误:', err);

  // Mongoose错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = { message, statusCode: 404 };
  }

  // Mongoose重复键错误
  if (err.code === 11000) {
    const message = '资源已存在';
    error = { message, statusCode: 400 };
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
