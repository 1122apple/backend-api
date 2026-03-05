/**
 * 误导检测控制器
 */

const DetectionReport = require('../models/DetectionReport');
const fs = require('fs');

/**
 * 上传文件并分析
 * POST /api/detection/upload
 */
const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    // 确定源类型
    let sourceType = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      sourceType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      sourceType = 'audio';
    } else if (req.file.mimetype === 'text/plain') {
      sourceType = 'text';
    }

    // 创建检测报告
    const report = await DetectionReport.create({
      userId: req.user._id,
      sourceType,
      sourceFile: {
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileHash: req.file.hash
      },
      status: 'analyzing',
      evidence: {
        timestamp: new Date(),
        hash: req.file.hash
      }
    });

    // TODO: 调用AI模型进行误导检测
    // 这里先返回模拟数据
    setTimeout(async () => {
      report.analysis = {
        riskLevel: 'high',
        riskScore: 85,
        keywords: [
          {
            word: '统筹',
            risk: 'high',
            reason: '非保险产品，不受《保险法》保护',
            position: 0
          },
          {
            word: '绝对赔付',
            risk: 'high',
            reason: '虚假承诺，违反保险法规定',
            position: 0
          }
        ],
        suggestions: [
          '请通过银保监会官网查询该产品是否为正规保险',
          '保存所有聊天记录、录音和合同作为维权证据',
          '如已购买，建议立即咨询专业律师'
        ],
        analyzedAt: new Date()
      };
      report.status = 'completed';
      await report.save();
    }, 2000);

    res.status(201).json({
      success: true,
      message: '文件上传成功，正在分析中',
      data: {
        reportId: report._id,
        status: 'analyzing'
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: '上传失败',
      error: error.message
    });
  }
};

/**
 * 获取分析报告
 * GET /api/detection/reports/:id
 */
const getReport = async (req, res) => {
  try {
    const report = await DetectionReport.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '报告不存在'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取报告失败',
      error: error.message
    });
  }
};

/**
 * 获取报告列表
 * GET /api/detection/reports
 */
const getReportList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await DetectionReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-sourceFile.filePath');

    const total = await DetectionReport.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取报告列表失败',
      error: error.message
    });
  }
};

module.exports = {
  uploadAndAnalyze,
  getReport,
  getReportList
};
