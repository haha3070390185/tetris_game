const express = require('express')
const router = express.Router()
const { addScore, getAllScores, getHighestScore } = require('../database')

router.post('/', async (req, res) => {
  try {
    const { name, score } = req.body
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '请输入你的名字'
      })
    }
    
    if (score === undefined || score === null || isNaN(score)) {
      return res.status(400).json({
        success: false,
        message: '分数无效'
      })
    }
    
    const result = await addScore(name.trim(), parseInt(score))
    
    res.json({
      success: true,
      message: '分数保存成功',
      data: result
    })
  } catch (error) {
    console.error('保存分数失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100
    const scores = await getAllScores(limit)
    
    res.json({
      success: true,
      message: '获取分数成功',
      data: scores
    })
  } catch (error) {
    console.error('获取分数失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

router.get('/high', async (req, res) => {
  try {
    const highestScore = await getHighestScore()
    
    res.json({
      success: true,
      message: '获取最高分成功',
      data: highestScore
    })
  } catch (error) {
    console.error('获取最高分失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

module.exports = router
