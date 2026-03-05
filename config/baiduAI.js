// 百度AI语音转文字配置
const AipSpeechClient = require('baidu-aip-sdk').speech;
require('dotenv').config(); // 确保加载环境变量

// 从环境变量获取百度AI密钥
const APP_ID = process.env.BAIDU_APP_ID || '';
const API_KEY = process.env.BAIDU_API_KEY || '';
const SECRET_KEY = process.env.BAIDU_SECRET_KEY || '';

// 创建语音识别客户端实例
const client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);

module.exports = client;