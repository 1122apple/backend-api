/**
 * 证据管理路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, calculateFileHash } = require('../middleware/upload');
const {
  uploadEvidence,
  getEvidenceList,
  getEvidence,
  verifyEvidence,
  generateEvidenceList
} = require('../controllers/evidenceController');

// 所有路由都需要认证
router.use(authenticate);

// 上传证据
router.post('/upload', upload.single('file'), calculateFileHash, uploadEvidence);

// 获取证据列表
router.get('/list', getEvidenceList);

// 获取证据详情
router.get('/:id', getEvidence);

// 验证证据完整性
router.post('/verify', verifyEvidence);

// 生成证据清单
router.post('/generate-list', generateEvidenceList);

module.exports = router;
