/**
 * 数据看板路由
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);

/**
 * 获取统计数据
 * GET /api/dashboard/stats
 */
router.get('/stats', async (req, res) => {
  try {
    // TODO: 从数据库获取真实统计数据
    const stats = {
      totalComplaints: 1247,
      aiDetectedCases: 856,
      successRate: 87.5
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
});

/**
 * 获取区域投诉数据
 * GET /api/dashboard/regions
 */
router.get('/regions', async (req, res) => {
  try {
    // TODO: 从数据库获取真实数据
    const regions = [
      { region: '华东地区', complaints: 456, risk: 'high', change: '+12%' },
      { region: '华南地区', complaints: 328, risk: 'high', change: '+8%' },
      { region: '华北地区', complaints: 287, risk: 'medium', change: '+5%' }
    ];

    res.json({
      success: true,
      data: { regions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取区域数据失败',
      error: error.message
    });
  }
});

module.exports = router;
