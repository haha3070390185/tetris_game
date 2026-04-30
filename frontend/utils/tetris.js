// 俄罗斯方块经典形状定义 - 萌系彩色
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
}

// 萌系彩色方块配色 - 糖果色系
const COLORS = {
  I: '#FF69B4',
  O: '#FFD700',
  T: '#9370DB',
  S: '#98FB98',
  Z: '#FF6347',
  J: '#87CEEB',
  L: '#FFA07A'
}

class TetrisGame {
  constructor(cols = 10, rows = 20) {
    this.cols = cols
    this.rows = rows
    this.board = this.createEmptyBoard()
    this.score = 0
    this.level = 1
    this.lines = 0
    this.currentPiece = null
    this.nextPiece = null
    this.currentX = 0
    this.currentY = 0
    this.gameOver = false
    
    this.spawnPiece()
  }

  createEmptyBoard() {
    return Array(this.rows).fill(null).map(() => 
      Array(this.cols).fill(null)
    )
  }

  getRandomShape() {
    const shapeNames = Object.keys(SHAPES)
    const randomIndex = Math.floor(Math.random() * shapeNames.length)
    const name = shapeNames[randomIndex]
    return {
      name,
      shape: SHAPES[name],
      color: COLORS[name]
    }
  }

  spawnPiece() {
    if (this.nextPiece === null) {
      this.nextPiece = this.getRandomShape()
    }
    
    this.currentPiece = this.nextPiece
    this.nextPiece = this.getRandomShape()
    
    this.currentX = Math.floor((this.cols - this.currentPiece.shape[0].length) / 2)
    this.currentY = 0
    
    if (this.checkCollision(this.currentX, this.currentY, this.currentPiece.shape)) {
      this.gameOver = true
    }
  }

  checkCollision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col
          const newY = y + row
          
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return true
          }
          
          if (newY >= 0 && this.board[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }

  rotate() {
    const rotated = this.rotateMatrix(this.currentPiece.shape)
    if (!this.checkCollision(this.currentX, this.currentY, rotated)) {
      this.currentPiece.shape = rotated
    }
  }

  rotateMatrix(matrix) {
    const rows = matrix.length
    const cols = matrix[0].length
    const rotated = []
    
    for (let col = 0; col < cols; col++) {
      const newRow = []
      for (let row = rows - 1; row >= 0; row--) {
        newRow.push(matrix[row][col])
      }
      rotated.push(newRow)
    }
    
    return rotated
  }

  moveLeft() {
    if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece.shape)) {
      this.currentX--
    }
  }

  moveRight() {
    if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece.shape)) {
      this.currentX++
    }
  }

  moveDown() {
    if (this.gameOver) {
      return { gameOver: true, linesCleared: 0 }
    }
    
    if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
      this.currentY++
      return { gameOver: false, linesCleared: 0 }
    } else {
      return this.lockPiece()
    }
  }

  hardDrop() {
    let dropDistance = 0
    
    while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
      this.currentY++
      dropDistance++
    }
    
    this.score += dropDistance * 2
    
    return this.lockPiece()
  }

  lockPiece() {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardY = this.currentY + row
          const boardX = this.currentX + col
          
          if (boardY < 0) {
            this.gameOver = true
            return { gameOver: true, linesCleared: 0 }
          }
          
          this.board[boardY][boardX] = this.currentPiece.color
        }
      }
    }
    
    const linesCleared = this.clearLines()
    this.spawnPiece()
    
    return { gameOver: this.gameOver, linesCleared }
  }

  clearLines() {
    let linesCleared = 0
    
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== null)) {
        this.board.splice(row, 1)
        this.board.unshift(Array(this.cols).fill(null))
        linesCleared++
        row++
      }
    }
    
    return linesCleared
  }

  getState() {
    const board = JSON.parse(JSON.stringify(this.board))
    
    if (this.currentPiece && !this.gameOver) {
      for (let row = 0; row < this.currentPiece.shape.length; row++) {
        for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
          if (this.currentPiece.shape[row][col]) {
            const boardY = this.currentY + row
            const boardX = this.currentX + col
            
            if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
              board[boardY][boardX] = this.currentPiece.color
            }
          }
        }
      }
    }
    
    return {
      board,
      score: this.score,
      level: this.level,
      lines: this.lines,
      gameOver: this.gameOver
    }
  }

  getNextPiece() {
    return this.nextPiece
  }

  setScore(score) {
    this.score = score
  }

  setLevel(level) {
    this.level = level
  }

  setLines(lines) {
    this.lines = lines
  }
}

module.exports = {
  TetrisGame,
  SHAPES,
  COLORS
}
