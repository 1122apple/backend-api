/**
 * 文件上传中间件
 * 使用multer处理文件上传
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { hashFile } = require('../config/encryption');

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型创建子目录
    const type = file.mimetype.split('/')[0]; // image, audio, application
    const subDir = path.join(uploadDir, type);
    
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

/**
 * 计算文件哈希的中间件
 */
const calculateFileHash = (req, res, next) => {
  if (req.file) {
    const fileBuffer = fs.readFileSync(req.file.path);
    req.file.hash = hashFile(fileBuffer);
    req.file.size = fileBuffer.length;
  }
  next();
};

module.exports = {
  upload,
  calculateFileHash
};
