const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const { authenticate } = require('../middleware/auth');

// 保存测试结果
router.post('/save-test-result', authenticate, learningController.saveTestResult);

// 获取测试结果
router.get('/get-test-results', authenticate, learningController.getUserTestResults);

module.exports = router;