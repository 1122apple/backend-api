/**
 * 语音助手路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, calculateFileHash } = require('../middleware/upload');
const {
  uploadVoice,
  getVoiceResult
} = require('../controllers/voiceController');

// 所有路由都需要认证
router.use(authenticate);

// 上传语音文件
router.post('/upload', upload.single('file'), calculateFileHash, uploadVoice);

// 获取语音分析结果
router.get('/result/:id', getVoiceResult);

module.exports = router;
