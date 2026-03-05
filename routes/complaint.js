/**
 * 投诉管理路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateComplaint } = require('../utils/validator');
const {
  createComplaint,
  getComplaintList,
  getComplaint,
  getAgencies
} = require('../controllers/complaintController');

// 所有路由都需要认证
router.use(authenticate);

// 创建投诉
router.post('/create', validateComplaint, createComplaint);

// 获取投诉列表
router.get('/list', getComplaintList);

// 获取投诉详情
router.get('/:id', getComplaint);

// 获取监管机构联系方式
router.get('/agencies/list', getAgencies);

module.exports = router;
