/**
 * 证据管理控制器（电子存证）
 */

const Evidence = require('../models/Evidence');
const fs = require('fs');
const crypto = require('crypto');

/**
 * 上传证据
 * POST /api/evidence/upload
 */
const uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    // 确定证据类型
    let evidenceType = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      evidenceType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      evidenceType = 'audio';
    }

    // 计算MD5哈希（备用）
    const fileBuffer = fs.readFileSync(req.file.path);
    const md5Hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // 创建证据记录（电子存证）
    const evidence = await Evidence.create({
      userId: req.user._id,
      type: evidenceType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileHash: req.file.hash,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      metadata: {
        description: req.body.description || '',
        relatedComplaintId: req.body.relatedComplaintId || null,
        relatedContractId: req.body.relatedContractId || null,
        location: req.body.location || '',
        recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date()
      },
      timestamp: {
        createdAt: new Date(),
        uploadedAt: new Date()
      },
      hash: {
        sha256: req.file.hash,
        md5: md5Hash
      },
      integrity: {
        isVerified: true,
        verifiedAt: new Date(),
        verificationResult: '文件完整性验证通过'
      },
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: '证据上传成功',
      data: {
        evidence: {
          id: evidence._id,
          type: evidence.type,
          fileName: evidence.fileName,
          fileHash: evidence.hash.sha256,
          uploadedAt: evidence.timestamp.uploadedAt
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
      message: '证据上传失败',
      error: error.message
    });
  }
};

/**
 * 获取证据列表
 * GET /api/evidence/list
 */
const getEvidenceList = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id, status: 'active' };
    if (type) {
      query.type = type;
    }

    const evidences = await Evidence.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-filePath'); // 不返回文件路径

    const total = await Evidence.countDocuments(query);

    res.json({
      success: true,
      data: {
        evidences,
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
      message: '获取证据列表失败',
      error: error.message
    });
  }
};

/**
 * 获取证据详情
 * GET /api/evidence/:id
 */
const getEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: '证据不存在'
      });
    }

    res.json({
      success: true,
      data: {
        evidence: {
          id: evidence._id,
          type: evidence.type,
          fileName: evidence.fileName,
          fileSize: evidence.fileSize,
          fileHash: evidence.hash.sha256,
          timestamp: evidence.timestamp,
          integrity: evidence.integrity,
          metadata: evidence.metadata,
          createdAt: evidence.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取证据失败',
      error: error.message
    });
  }
};

/**
 * 验证证据完整性
 * POST /api/evidence/verify
 */
const verifyEvidence = async (req, res) => {
  try {
    const { id } = req.body;

    const evidence = await Evidence.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: '证据不存在'
      });
    }

    // 读取文件并计算哈希
    if (!fs.existsSync(evidence.filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    const fileBuffer = fs.readFileSync(evidence.filePath);
    const currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 验证哈希值
    const isIntact = currentHash === evidence.hash.sha256;

    // 更新验证信息
    evidence.integrity.isVerified = isIntact;
    evidence.integrity.verifiedAt = new Date();
    evidence.integrity.verificationResult = isIntact 
      ? '文件完整性验证通过' 
      : '文件已被篡改';
    await evidence.save();

    res.json({
      success: true,
      data: {
        isIntact,
        message: isIntact ? '文件完整性验证通过' : '文件已被篡改',
        originalHash: evidence.hash.sha256,
        currentHash
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '验证失败',
      error: error.message
    });
  }
};

/**
 * 生成证据清单
 * POST /api/evidence/generate-list
 */
const generateEvidenceList = async (req, res) => {
  try {
    const { evidenceIds } = req.body;

    const evidences = await Evidence.find({
      _id: { $in: evidenceIds },
      userId: req.user._id
    }).select('-filePath');

    const evidenceList = evidences.map(evidence => ({
      id: evidence._id,
      type: evidence.type,
      fileName: evidence.fileName,
      fileHash: evidence.hash.sha256,
      timestamp: evidence.timestamp,
      description: evidence.metadata.description
    }));

    res.json({
      success: true,
      data: {
        evidenceList,
        generatedAt: new Date(),
        total: evidenceList.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '生成证据清单失败',
      error: error.message
    });
  }
};

module.exports = {
  uploadEvidence,
  getEvidenceList,
  getEvidence,
  verifyEvidence,
  generateEvidenceList
};
