/**
 * 证据数据模型（电子存证）
 */

const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['audio', 'image', 'document', 'chat'],
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
  metadata: {
    description: String,
    relatedComplaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint'
    },
    relatedContractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    },
    location: String,
    recordedAt: Date
  },
  timestamp: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date
  },
  hash: {
    sha256: {
      type: String,
      required: true
    },
    md5: String
  },
  integrity: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verificationResult: String
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// 索引
evidenceSchema.index({ userId: 1, createdAt: -1 });
evidenceSchema.index({ type: 1 });
evidenceSchema.index({ 'hash.sha256': 1 });

module.exports = mongoose.model('Evidence', evidenceSchema);
