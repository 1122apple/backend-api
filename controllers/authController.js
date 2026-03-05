/**
 * 用户认证控制器
 * 
 * 用C语言思维理解：
 * - 控制器类似C中的处理函数
 * - req, res 类似C中的参数和返回值
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * 生成JWT Token
 * 类似C中的生成令牌函数
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * 用户注册
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, password, phone, email, profile } = req.body;

    // 检查用户名是否已存在（类似C中的查找函数）
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 创建新用户（类似C中的结构体初始化）
    const user = await User.create({
      username,
      password, // 会在pre-save中间件中自动加密
      phone,
      email,
      profile
    });

    // 生成token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
};

/**
 * 用户登录
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户（类似C中的数据库查询）
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码（类似C中的密码验证函数）
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
};

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
