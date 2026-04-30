const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')

const { initDatabase } = require('./database')
const scoresRoutes = require('./routes/scores')

const app = express()
const PORT = process.env.PORT || 3000

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('✅ 数据目录已创建:', dataDir)
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '萌系俄罗斯方块后端服务运行正常',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/scores', scoresRoutes)

app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err)
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  })
})

async function startServer() {
  try {
    console.log('🚀 正在启动萌系俄罗斯方块后端服务...')
    
    console.log('📦 初始化数据库...')
    await initDatabase()
    console.log('✅ 数据库初始化完成')
    
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                            ║
║    🎮 萌系俄罗斯方块后端服务启动成功！                     ║
║                                                            ║
║    📍 服务地址: http://localhost:${PORT}                     ║
║                                                            ║
║    🔗 可用API接口:                                          ║
║       GET  /api/health       - 健康检查                    ║
║       GET  /api/scores       - 获取所有分数排行            ║
║       GET  /api/scores/high  - 获取最高分                  ║
║       POST /api/scores       - 保存分数 (name, score)      ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('❌ 启动服务失败:', error.message)
    process.exit(1)
  }
}

startServer()
