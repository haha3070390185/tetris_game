const { TetrisGame, SHAPES, COLORS } = require('../../../utils/tetris')
const api = require('../../../utils/api')

Page({
  data: {
    gameBoard: [],
    score: 0,
    level: 1,
    lines: 0,
    nextShape: null,
    nextShapeColor: '',
    isGameOver: false,
    isPaused: false,
    gameStarted: false,
    highScore: 0,
    playerName: '',
    isApiAvailable: true
  },

  tetrisGame: null,
  gameInterval: null,

  onLoad() {
    this.initGame()
    this.loadHighScore()
  },

  onUnload() {
    this.stopGame()
  },

  initGame() {
    this.tetrisGame = new TetrisGame(10, 20)
    this.updateGameState()
  },

  startGame() {
    this.initGame()
    this.setData({
      gameStarted: true,
      isGameOver: false,
      isPaused: false,
      score: 0,
      level: 1,
      lines: 0
    })
    this.runGame()
  },

  runGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval)
    }
    
    const speed = Math.max(100, 800 - (this.data.level - 1) * 100)
    
    this.gameInterval = setInterval(() => {
      if (!this.data.isPaused && !this.data.isGameOver) {
        this.moveDown()
      }
    }, speed)
  },

  moveDown() {
    const result = this.tetrisGame.moveDown()
    this.updateGameState()
    
    if (result.gameOver) {
      this.handleGameOver()
    } else if (result.linesCleared > 0) {
      this.addScore(result.linesCleared)
    }
  },

  moveLeft() {
    this.tetrisGame.moveLeft()
    this.updateGameState()
  },

  moveRight() {
    this.tetrisGame.moveRight()
    this.updateGameState()
  },

  rotate() {
    this.tetrisGame.rotate()
    this.updateGameState()
  },

  hardDrop() {
    const result = this.tetrisGame.hardDrop()
    this.updateGameState()
    
    if (result.gameOver) {
      this.handleGameOver()
    } else if (result.linesCleared > 0) {
      this.addScore(result.linesCleared)
    }
  },

  updateGameState() {
    const state = this.tetrisGame.getState()
    const nextPiece = this.tetrisGame.getNextPiece()
    
    this.setData({
      gameBoard: state.board,
      score: state.score,
      level: state.level,
      lines: state.lines,
      nextShape: nextPiece.shape,
      nextShapeColor: nextPiece.color
    })
  },

  addScore(linesCleared) {
    const points = [0, 100, 300, 500, 800]
    const newScore = this.data.score + points[linesCleared] * this.data.level
    const newLines = this.data.lines + linesCleared
    const newLevel = Math.floor(newLines / 10) + 1
    
    this.tetrisGame.setScore(newScore)
    this.tetrisGame.setLevel(newLevel)
    this.tetrisGame.setLines(newLines)
    
    this.setData({
      score: newScore,
      lines: newLines,
      level: newLevel
    })
    
    if (newLevel > this.data.level) {
      this.runGame()
    }
  },

  handleGameOver() {
    this.stopGame()
    this.setData({
      isGameOver: true,
      gameStarted: false
    })
    
    if (this.data.score > this.data.highScore) {
      this.setData({
        highScore: this.data.score
      })
      wx.showToast({
        title: '新纪录！🎉',
        icon: 'none'
      })
    }
  },

  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval)
      this.gameInterval = null
    }
  },

  togglePause() {
    this.setData({
      isPaused: !this.data.isPaused
    })
  },

  restartGame() {
    this.stopGame()
    this.startGame()
  },

  async loadHighScore() {
    try {
      console.log('开始加载最高分...')
      
      const result = await api.scores.getHighest()
      
      console.log('API返回结果:', result)
      
      if (result && result.success) {
        const score = result.data ? (result.data.score || 0) : 0
        this.setData({
          highScore: score,
          isApiAvailable: true
        })
        console.log('当前最高分已设置:', score)
      } else {
        console.log('API返回非成功状态:', result)
        this.setData({
          isApiAvailable: false
        })
      }
    } catch (error) {
      console.error('加载最高分失败:', error)
      this.setData({
        isApiAvailable: false
      })
      
      wx.showToast({
        title: '离线模式，游戏可正常游玩',
        icon: 'none',
        duration: 2500
      })
    }
  },

  async submitScore() {
    if (!this.data.playerName) {
      wx.showToast({
        title: '请输入你的名字',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '保存中...',
    })
    
    try {
      console.log('提交分数:', this.data.playerName, this.data.score)
      
      const result = await api.scores.submit(
        this.data.playerName,
        this.data.score
      )
      
      wx.hideLoading()
      
      console.log('保存分数结果:', result)
      
      if (result && result.success) {
        wx.showToast({
          title: '保存成功！',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: result ? result.message : '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('保存分数失败:', error)
      
      wx.showModal({
        title: '保存失败',
        content: `无法连接到服务器。\n\n当前分数: ${this.data.score}\n请确保后端服务已启动：\n1. 进入 backend 目录\n2. 运行: npm start\n\n或者分数已保存到本地。`,
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          try {
            wx.setStorageSync(`local_score_${Date.now()}`, {
              name: this.data.playerName,
              score: this.data.score,
              time: new Date().toISOString()
            })
            console.log('分数已保存到本地存储')
          } catch (e) {
            console.error('本地存储失败:', e)
          }
        }
      })
    }
  },

  onNameInput(e) {
    this.setData({
      playerName: e.detail.value
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
