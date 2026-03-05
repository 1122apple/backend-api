/**
 * 投诉数据模型
 */

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaintId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['insurance', 'agent', 'tongchou'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'accepted', 'processing', 'replied', 'closed'],
    default: 'submitted'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  evidenceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence'
  }],
  processing: [{
    step: String,
    description: String,
    operator: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  reply: {
    content: String,
    repliedAt: Date,
    repliedBy: String
  }
}, {
  timestamps: true
});

// 生成投诉编号的静态方法
complaintSchema.statics.generateComplaintId = function() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
                  (now.getMonth() + 1).toString().padStart(2, '0') +
                  now.getDate().toString().padStart(2, '0');
  
  // 这里简化处理，实际应该查询数据库获取当日序号
  const seq = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `C${dateStr}${seq}`;
};

// 索引
complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
