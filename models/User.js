/**
 * 用户数据模型
 * 
 * 用C语言思维理解：
 * - Schema 类似C中的结构体定义（struct）
 * - Model 类似C中的结构体实例化
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../config/encryption');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    sparse: true, // 允许为空，但不重复
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['driver', 'admin'],
    default: 'driver'
  },
  profile: {
    realName: String,
    idCard: String,      // 加密存储
    licensePlate: String,
    vehicleType: String
  },
  lastLoginAt: Date
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 密码加密中间件（保存前执行，类似C中的预处理）
userSchema.pre('save', async function(next) {
  // 如果密码未修改，跳过
  if (!this.isModified('password')) {
    return next();
  }
  
  // 使用bcrypt加密密码（类似C中的加密函数）
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 如果身份证号存在，加密存储
userSchema.pre('save', function(next) {
  if (this.profile && this.profile.idCard) {
    this.profile.idCard = encrypt(this.profile.idCard);
  }
  next();
});

// 实例方法：验证密码（类似C中的函数）
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 实例方法：获取解密后的身份证号
userSchema.methods.getDecryptedIdCard = function() {
  if (this.profile && this.profile.idCard) {
    return decrypt(this.profile.idCard);
  }
  return null;
};

module.exports = mongoose.model('User', userSchema);
