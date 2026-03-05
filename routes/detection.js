/**
 * 误导检测路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, calculateFileHash } = require('../middleware/upload');
const {
  uploadAndAnalyze,
  getReport,
  getReportList
} = require('../controllers/detectionController');

// 所有路由都需要认证
router.use(authenticate);

// 上传文件并分析
router.post('/upload', upload.single('file'), calculateFileHash, uploadAndAnalyze);

// 获取分析报告
router.get('/reports/:id', getReport);

// 获取报告列表
router.get('/reports', getReportList);

module.exports = router;
