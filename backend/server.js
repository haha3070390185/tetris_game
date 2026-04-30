const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const scoresRoutes = require('./routes/scores')

const app = express()
const PORT = process.env.PORT || 3000

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('数据目录已创建')
}

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.use('/api/scores', scoresRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '萌系俄罗斯方块后端服务运行正常',
    timestamp: new Date().toISOString()
  })
})

app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  })
})

app.listen(PORT, () => {
  console.log(`
  🎮 萌系俄罗斯方块后端服务启动成功！
  📍 服务地址: http://localhost:${PORT}
  🔗 API接口:
     - POST /api/scores    - 保存分数
     - GET  /api/scores    - 获取所有分数
     - GET  /api/scores/high - 获取最高分
     - GET  /api/health    - 健康检查
  `)
})
