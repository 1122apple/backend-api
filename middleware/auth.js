/**
 * JWT认证中间件
 * 
 * 用C语言思维理解：
 * - 中间件类似C中的函数调用链
 * - next() 类似C中的函数返回或继续执行
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 验证JWT Token
 * 类似C中的权限检查函数
 */
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取token（类似C中从参数获取）
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 验证token（类似C中的验证函数）
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户（类似C中的数据库查询）
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 将用户信息附加到请求对象（类似C中的全局变量或参数传递）
    req.user = user;
    next(); // 继续执行下一个中间件或路由处理函数
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌',
      error: error.message
    });
  }
};

module.exports = { authenticate };
