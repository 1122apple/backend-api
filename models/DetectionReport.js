/**
 * 误导检测报告数据模型
 */

const mongoose = require('mongoose');

const detectionReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourceType: {
    type: String,
    enum: ['text', 'audio', 'image', 'document'],
    required: true
  },
  sourceFile: {
    fileName: String,
    filePath: String,
    fileHash: String
  },
  analysis: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    keywords: [{
      word: String,
      risk: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      reason: String,
      position: Number
    }],
    suggestions: [String],
    analyzedAt: Date
  },
  evidence: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    hash: String
  },
  status: {
    type: String,
    enum: ['analyzing', 'completed', 'failed'],
    default: 'analyzing'
  }
}, {
  timestamps: true
});

// 索引
detectionReportSchema.index({ userId: 1, createdAt: -1 });
detectionReportSchema.index({ status: 1 });

module.exports = mongoose.model('DetectionReport', detectionReportSchema);
