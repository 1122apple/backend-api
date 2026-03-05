/**
 * 合同管理控制器
 */

const Contract = require('../models/Contract');
const fs = require('fs');
const path = require('path');

/**
 * 上传合同
 * POST /api/contract/upload
 */
const uploadContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    const contract = await Contract.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileHash: req.file.hash,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploaded'
    });

    res.status(201).json({
      success: true,
      message: '合同上传成功',
      data: {
        contract: {
          id: contract._id,
          fileName: contract.fileName,
          status: contract.status,
          uploadedAt: contract.createdAt
        }
      }
    });
  } catch (error) {
    // 如果创建失败，删除已上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: '合同上传失败',
      error: error.message
    });
  }
};

/**
 * AI分析合同（预留接口，后续集成AI模型）
 * POST /api/contract/analyze
 */
const analyzeContract = async (req, res) => {
  try {
    const { contractId } = req.body;

    const contract = await Contract.findOne({
      _id: contractId,
      userId: req.user._id
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: '合同不存在'
      });
    }

    // 更新状态为分析中
    contract.status = 'analyzing';
    await contract.save();

    // TODO: 调用AI模型进行合同分析
    // 这里先返回模拟数据
    setTimeout(async () => {
      contract.contractInfo = {
        productName: '货车司机综合保险',
        insuranceCompany: '中国人保',
        insurancePeriod: '1年',
        insuranceAmount: '100万元',
        isLegitimate: true
      };

      contract.analysis = {
        riskLevel: 'medium',
        clauses: [
          {
            title: '免责条款',
            original: '因战争、暴乱、核辐射等不可抗力造成的损失不予赔偿',
            interpretation: '这是常见的免责条款，属于正常范围。',
            risk: 'low'
          }
        ],
        summary: '该合同为正规保险产品，整体风险中等。',
        analyzedAt: new Date()
      };

      contract.status = 'completed';
      await contract.save();
    }, 2000);

    res.json({
      success: true,
      message: '合同分析已开始',
      data: {
        contractId: contract._id,
        status: 'analyzing'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '合同分析失败',
      error: error.message
    });
  }
};

/**
 * 获取合同详情
 * GET /api/contract/:id
 */
const getContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: '合同不存在'
      });
    }

    res.json({
      success: true,
      data: { contract }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取合同失败',
      error: error.message
    });
  }
};

/**
 * 获取合同列表
 * GET /api/contract/list
 */
const getContractList = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const contracts = await Contract.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-filePath'); // 不返回文件路径

    const total = await Contract.countDocuments(query);

    res.json({
      success: true,
      data: {
        contracts,
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
      message: '获取合同列表失败',
      error: error.message
    });
  }
};

module.exports = {
  uploadContract,
  analyzeContract,
  getContract,
  getContractList
};
