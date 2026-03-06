/**
 * 用户认证路由
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../utils/validator');
// 注册
router.post('/register', validateRegister, register);

// 登录
router.post('/login', validateLogin, login);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getMe);

module.exports = router;
