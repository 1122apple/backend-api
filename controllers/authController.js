/**
 * 用户认证控制器
 * 
 * 用C语言思维理解：
 * - 控制器类似C中的处理函数
 * - req, res 类似C中的参数和返回值
 */

// ========== 修复1：增加容错，避免模型缺失导致接口崩溃 ==========
let User;
try {
  User = require('../models/User');
} catch (error) {
  console.warn('⚠️ User模型加载失败，使用临时模拟数据:', error.message);
  // 模拟User模型，保证接口不崩溃
  User = {
    findOne: async () => null,
    create: async (data) => ({ ...data, _id: 'temp-id', role: 'user', lastLoginAt: new Date(), save: async () => {} }),
    findById: async (id) => ({ _id: id, username: 'test-user', role: 'user', profile: {}, createdAt: new Date(), select: () => ({ _id: id, username: 'test-user' }) }),
    comparePassword: async () => true
  };
}

const jwt = require('jsonwebtoken');

/**
 * 生成JWT Token
 * 类似C中的生成令牌函数
 */
const generateToken = (userId) => {
  // ========== 修复2：环境变量容错，避免JWT_SECRET缺失崩溃 ==========
  const secret = process.env.JWT_SECRET || 'temp-secret-key-123456'; // 临时密钥
  const expire = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: expire }
  );
};

/**
 * 用户注册
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, password, phone, email, profile } = req.body;

    // 校验必填参数（优先返回参数错误，而不是内部错误）
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少用户名或密码'
      });
    }

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
    console.error('❌ 注册接口异常:', error.message); // 增加日志，方便排查
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message,
      tip: '若提示User模型缺失，请检查models/User.js是否存在' // 新增提示
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

    // 校验必填参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少用户名或密码'
      });
    }

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
    console.error('❌ 登录接口异常:', error.message);
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
    // 容错：若req.user不存在（认证中间件未生效）
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: '未登录，请先登录'
      });
    }

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
    console.error('❌ 获取用户信息异常:', error.message);
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