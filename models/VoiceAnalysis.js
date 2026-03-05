/**
 * 语音分析数据模型
 */

const mongoose = require('mongoose');

const voiceAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioFile: {
    fileName: String,
    filePath: String,
    fileHash: String,
    duration: Number // 时长（秒）
  },
  transcription: {
    text: String,
    segments: [{
      text: String,
      startTime: Number,
      endTime: Number
    }],
    dialect: String
  },
  detection: {
    hasMisleading: Boolean,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    misleadingSegments: [{
      text: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      reason: String,
      warning: String,
      position: Number
    }],
    analyzedAt: Date
  },
  status: {
    type: String,
    enum: ['uploading', 'transcribing', 'analyzing', 'completed', 'failed'],
    default: 'uploading'
  }
}, {
  timestamps: true
});

// 索引
voiceAnalysisSchema.index({ userId: 1, createdAt: -1 });
voiceAnalysisSchema.index({ status: 1 });

module.exports = mongoose.model('VoiceAnalysis', voiceAnalysisSchema);
