const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'data', 'tetris.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message)
  } else {
    console.log('成功连接到SQLite数据库')
    initDatabase()
  }
})

function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建表失败:', err.message)
    } else {
      console.log('scores表已就绪')
    }
  })
}

function addScore(name, score) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO scores (name, score) VALUES (?, ?)',
      [name, score],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, name, score })
        }
      }
    )
  })
}

function getAllScores(limit = 100) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM scores ORDER BY score DESC, created_at ASC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      }
    )
  })
}

function getHighestScore() {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM scores ORDER BY score DESC, created_at ASC LIMIT 1',
      (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row || { score: 0 })
        }
      }
    )
  })
}

module.exports = {
  db,
  addScore,
  getAllScores,
  getHighestScore
}
