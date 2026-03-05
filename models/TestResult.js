/**
 * 测试结果模型
 * 用于存储用户的测试成绩
 */

const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    required: true,
    enum: ['rightsProtection', 'basicInsurance', 'misleadingDetection', 'contract', 'voice'] // 测试类型
  },
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新updatedAt字段
TestResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TestResult', TestResultSchema);