const app = getApp()
const { TetrisGame, SHAPES, COLORS } = require('../../../utils/tetris')

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
    playerName: ''
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

  loadHighScore() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/scores/high`,
      method: 'GET',
      success: (res) => {
        console.log('获取最高分响应:', res.data)
        if (res.data && res.data.success) {
          const score = res.data.data ? (res.data.data.score || 0) : 0
          this.setData({
            highScore: score
          })
          console.log('当前最高分:', score)
        } else {
          console.log('API返回非成功状态:', res.data)
        }
      },
      fail: (err) => {
        console.log('获取最高分失败（后端可能未启动）:', err)
        wx.showToast({
          title: '离线模式，游戏可正常游玩',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  submitScore() {
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
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/scores`,
      method: 'POST',
      data: {
        name: this.data.playerName,
        score: this.data.score
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading()
        console.log('保存分数响应:', res.data)
        if (res.data && res.data.success) {
          wx.showToast({
            title: '保存成功！',
            icon: 'success'
          })
          
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data ? res.data.message : '保存失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.log('保存分数失败:', err)
        wx.showModal({
          title: '保存失败',
          content: '无法连接到服务器，分数已保存到本地。请稍后在排行榜中手动记录。',
          showCancel: false,
          success: () => {
            wx.setStorageSync(`local_score_${Date.now()}`, {
              name: this.data.playerName,
              score: this.data.score,
              time: new Date().toISOString()
            })
            wx.navigateBack()
          }
        })
      }
    })
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
