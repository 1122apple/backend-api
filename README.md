# 货车司机权益保障平台 - 后端API

## 项目简介
这是《"误导投保"的法律问题剖析与AI赋能权益保障》项目的后端服务，基于Node.js + Express + MongoDB开发。

## 技术栈
- **运行环境**: Node.js 18+
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **安全**: Helmet, CORS, Rate Limiting
- **加密**: bcryptjs, crypto

## 项目结构
```
backend/
├── config/          # 配置文件
│   ├── database.js  # MongoDB连接配置
│   └── encryption.js # 加密工具
├── models/          # 数据模型（Mongoose Schema）
│   ├── User.js
│   ├── Contract.js
│   ├── Evidence.js
│   ├── DetectionReport.js
│   ├── Complaint.js
│   └── VoiceAnalysis.js
├── routes/          # 路由定义
│   ├── auth.js
│   ├── contract.js
│   ├── evidence.js
│   ├── detection.js
│   ├── complaint.js
│   └── voice.js
├── controllers/     # 业务逻辑控制器
│   ├── authController.js
│   ├── contractController.js
│   ├── evidenceController.js
│   ├── detectionController.js
│   ├── complaintController.js
│   └── voiceController.js
├── middleware/      # 中间件
│   ├── auth.js      # JWT认证中间件
│   ├── upload.js    # 文件上传中间件
│   └── errorHandler.js # 错误处理
├── utils/           # 工具函数
│   ├── hash.js      # 文件哈希计算
│   ├── timestamp.js # 时间戳工具
│   └── validator.js # 数据验证
├── uploads/         # 文件上传目录（gitignore）
├── server.js        # 服务器入口文件
├── package.json
└── .env            # 环境变量（需要创建）
```

## 安装和运行

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env`，并修改配置：
```bash
cp .env.example .env
```

### 3. 启动MongoDB
确保MongoDB服务已启动：
```bash
# macOS (使用Homebrew)
brew services start mongodb-community

# 或直接运行
mongod
```

### 4. 运行服务器
```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API文档

### 基础URL
```
http://localhost:3000/api
```

### 认证
所有需要认证的接口都需要在请求头中携带：
```
Authorization: Bearer <JWT_TOKEN>
```

详细API文档请参考 `API需求分析.md`

## 安全特性

1. **密码加密**: 使用bcrypt加密存储
2. **JWT认证**: 无状态token认证
3. **文件完整性**: SHA256哈希验证
4. **敏感数据加密**: AES-256加密存储
5. **电子存证**: 时间戳 + 哈希值保证不可篡改
6. **请求限流**: 防止API滥用
7. **CORS保护**: 跨域请求控制

## 开发说明

### 用C语言思维理解Node.js

1. **回调函数 = 函数指针**
   - C语言中函数指针：`void (*callback)(int)`
   - Node.js中回调：`function callback(err, data) {}`
   - 都是传递函数地址，在特定时机调用

2. **异步I/O = 非阻塞操作**
   - C语言：`select()` 或 `epoll()` 实现非阻塞
   - Node.js：事件循环（Event Loop）自动处理
   - 类似C的多路复用，但更高级

3. **模块系统 = 头文件 + 链接库**
   - C语言：`#include <stdio.h>` + 链接库
   - Node.js：`require('express')` + npm包
   - 都是代码复用机制

4. **Express路由 = 路由表**
   - C语言：switch-case或函数指针数组
   - Node.js：`app.get('/path', handler)`
   - 都是根据路径调用不同处理函数

5. **中间件 = 函数调用链**
   - C语言：函数嵌套调用
   - Node.js：`middleware1 -> middleware2 -> handler`
   - 类似C的函数调用栈

## 注意事项

1. **环境变量**: 生产环境必须修改 `.env` 中的密钥
2. **文件上传**: 确保 `uploads/` 目录有写权限
3. **MongoDB**: 确保数据库服务正常运行
4. **CORS**: 根据前端地址配置 `CORS_ORIGIN`

## 后续集成

- [ ] AI模型接口集成（误导检测、合同解析）
- [ ] 区块链存证（可选）
- [ ] 短信/邮件通知
- [ ] 数据统计分析
- [ ] 日志系统

## 许可证
ISC
