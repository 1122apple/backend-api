/**
 * 合同数据模型
 */

const mongoose = require('mongoose');
const { hashFile } = require('../config/encryption');

const contractSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  contractInfo: {
    productName: String,
    insuranceCompany: String,
    insurancePeriod: String,
    insuranceAmount: String,
    isLegitimate: Boolean
  },
  analysis: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    clauses: [{
      title: String,
      original: String,
      interpretation: String,
      risk: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }],
    summary: String,
    analyzedAt: Date
  },
  evidence: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    blockchainHash: String,
    signature: String
  },
  status: {
    type: String,
    enum: ['uploaded', 'analyzing', 'completed', 'failed'],
    default: 'uploaded'
  }
}, {
  timestamps: true
});

// 索引
contractSchema.index({ userId: 1, createdAt: -1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
