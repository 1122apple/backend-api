/**
 * 学习培训中心控制器
 * 处理测试结果的数据库操作
 */

const TestResult = require('../models/TestResult');

/**
 * 保存测试结果
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function saveTestResult(req, res) {
  try {
    const { testType, score, passed, answers } = req.body;
    const userId = req.user.id;

    // 检查是否已存在该类型的测试结果
    let existingResult = await TestResult.findOne({ userId, testType });

    if (existingResult) {
      // 更新现有结果
      existingResult.score = score;
      existingResult.passed = passed;
      existingResult.answers = answers;
      existingResult.updatedAt = new Date();
      await existingResult.save();
      res.json({ success: true, message: '测试结果已更新', result: existingResult });
    } else {
      // 创建新结果
      const newResult = new TestResult({
        userId,
        testType,
        score,
        passed,
        answers
      });
      await newResult.save();
      res.json({ success: true, message: '测试结果已保存', result: newResult });
    }
  } catch (error) {
    console.error('保存测试结果错误:', error);
    res.status(500).json({ success: false, message: '保存测试结果失败' });
  }
}

/**
 * 获取用户的测试结果
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function getUserTestResults(req, res) {
  try {
    const userId = req.user.id;
    const results = await TestResult.find({ userId });
    res.json({ success: true, results });
  } catch (error) {
    console.error('获取测试结果错误:', error);
    res.status(500).json({ success: false, message: '获取测试结果失败' });
  }
}

module.exports = {
  saveTestResult,
  getUserTestResults
};