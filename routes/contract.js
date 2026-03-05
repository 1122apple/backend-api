/**
 * 合同管理路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, calculateFileHash } = require('../middleware/upload');
const {
  uploadContract,
  analyzeContract,
  getContract,
  getContractList
} = require('../controllers/contractController');

// 所有路由都需要认证
router.use(authenticate);

// 上传合同
router.post('/upload', upload.single('file'), calculateFileHash, uploadContract);

// 分析合同
router.post('/analyze', analyzeContract);

// 获取合同详情
router.get('/:id', getContract);

// 获取合同列表
router.get('/list', getContractList);

module.exports = router;
