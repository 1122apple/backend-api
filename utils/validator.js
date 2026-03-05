/**
 * 数据验证工具函数
 */

const { body, validationResult } = require('express-validator');

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '验证失败',
      errors: errors.array()
    });
  }
  next();
};

// 用户注册验证规则
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  handleValidationErrors
];

// 用户登录验证规则
const validateLogin = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  handleValidationErrors
];

// 投诉创建验证规则
const validateComplaint = [
  body('type')
    .isIn(['insurance', 'agent', 'tongchou'])
    .withMessage('投诉类型无效'),
  body('title').notEmpty().withMessage('投诉标题不能为空'),
  body('content').notEmpty().withMessage('投诉内容不能为空'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaint
};
