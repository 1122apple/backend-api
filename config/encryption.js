/**
 * 数据加密工具
 * 
 * 用C语言思维理解：
 * - crypto.createCipheriv() 类似C中的加密函数（如AES_encrypt）
 * - 使用AES-256-CBC算法，类似C中的加密库
 */

const crypto = require('crypto');

// 确保加密密钥是32字节（64个十六进制字符）
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  // 如果未设置或长度不对，生成一个随机密钥
  ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  警告: ENCRYPTION_KEY未正确设置，已生成临时密钥。生产环境请设置32字节的密钥！');
}

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // 初始化向量长度（字节）

/**
 * 加密敏感数据（如身份证号）
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的字符串（格式：iv:encrypted）
 */
function encrypt(text) {
  if (!text) return null;
  
  // 生成随机IV（类似C中的随机数生成）
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // 创建加密器（类似C中的EVP_CIPHER_CTX）
  // 确保密钥是Buffer格式
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  // 加密数据
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // 返回 IV:加密数据（IV用于解密）
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 解密数据
 * @param {string} encryptedText - 加密的文本（格式：iv:encrypted）
 * @returns {string} - 解密后的原始文本
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    // 分离IV和加密数据
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // 创建解密器
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    
    // 解密数据
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    return null;
  }
}

/**
 * 计算文件哈希值（SHA256）
 * 类似C中的SHA256_Init, SHA256_Update, SHA256_Final
 * @param {Buffer} data - 文件数据
 * @returns {string} - 十六进制哈希值
 */
function hashFile(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  hashFile
};
