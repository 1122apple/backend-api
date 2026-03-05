/**
 * 投诉管理控制器
 */

const Complaint = require('../models/Complaint');
const Evidence = require('../models/Evidence');

/**
 * 创建投诉
 * POST /api/complaint/create
 */
const createComplaint = async (req, res) => {
  try {
    const { type, title, content, evidenceIds } = req.body;

    // 生成投诉编号（格式：C2024112301）
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0');
    
    // 查询当日投诉数量
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = await Complaint.countDocuments({
      createdAt: { $gte: todayStart }
    });
    
    const seq = (todayCount + 1).toString().padStart(2, '0');
    const complaintId = `C${dateStr}${seq}`;

    const complaint = await Complaint.create({
      userId: req.user._id,
      complaintId,
      type,
      title,
      content,
      evidenceIds: evidenceIds || [],
      status: 'submitted',
      progress: 0,
      processing: [{
        step: '提交投诉',
        description: '用户提交投诉申请',
        operator: req.user.username,
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      message: '投诉提交成功',
      data: {
        complaint: {
          id: complaint._id,
          complaintId: complaint.complaintId,
          title: complaint.title,
          status: complaint.status,
          createdAt: complaint.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '提交投诉失败',
      error: error.message
    });
  }
};

/**
 * 获取投诉列表
 * GET /api/complaint/list
 */
const getComplaintList = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('evidenceIds', 'fileName type');

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: {
        complaints,
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
      message: '获取投诉列表失败',
      error: error.message
    });
  }
};

/**
 * 获取投诉详情
 * GET /api/complaint/:id
 */
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('evidenceIds');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: '投诉不存在'
      });
    }

    res.json({
      success: true,
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取投诉失败',
      error: error.message
    });
  }
};

/**
 * 获取监管机构联系方式
 * GET /api/complaint/agencies
 */
const getAgencies = async (req, res) => {
  try {
    // 返回监管机构信息
    const agencies = [
      {
        name: '银保监会投诉热线',
        phone: '12378',
        time: '工作日 9:00-17:00'
      },
      {
        name: '消费者协会',
        phone: '12315',
        time: '全天24小时'
      },
      {
        name: '保险行业协会',
        phone: '010-66286688',
        time: '工作日 9:00-18:00'
      }
    ];

    res.json({
      success: true,
      data: { agencies }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取机构信息失败',
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getComplaintList,
  getComplaint,
  getAgencies
};
