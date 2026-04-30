const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dataDir = path.join(__dirname, 'data')
const dbPath = path.join(dataDir, 'tetris.db')

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log('✅ 数据目录已创建:', dataDir)
  } catch (err) {
    console.error('❌ 创建数据目录失败:', err.message)
  }
}

let db = null

function initDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    console.log('🔄 正在连接数据库...')
    
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:', err.message)
        reject(err)
        return
      }
      
      console.log('✅ 成功连接到SQLite数据库:', dbPath)
      
      db.run(`
        CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          score INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ 创建表失败:', err.message)
          reject(err)
        } else {
          console.log('✅ scores表已就绪')
          resolve(db)
        }
      })
    })
  })
}

function getDb() {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()')
  }
  return db
}

async function addScore(name, score) {
  const database = getDb()
  
  return new Promise((resolve, reject) => {
    database.run(
      'INSERT INTO scores (name, score) VALUES (?, ?)',
      [name, score],
      function(err) {
        if (err) {
          console.error('❌ 插入分数失败:', err.message)
          reject(err)
        } else {
          console.log(`✅ 分数已保存: ${name} - ${score}分`)
          resolve({ id: this.lastID, name, score })
        }
      }
    )
  })
}

async function getAllScores(limit = 100) {
  const database = getDb()
  
  return new Promise((resolve, reject) => {
    database.all(
      'SELECT * FROM scores ORDER BY score DESC, created_at ASC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) {
          console.error('❌ 查询分数失败:', err.message)
          reject(err)
        } else {
          console.log(`✅ 获取到 ${rows.length} 条分数记录`)
          resolve(rows)
        }
      }
    )
  })
}

async function getHighestScore() {
  const database = getDb()
  
  return new Promise((resolve, reject) => {
    database.get(
      'SELECT * FROM scores ORDER BY score DESC, created_at ASC LIMIT 1',
      (err, row) => {
        if (err) {
          console.error('❌ 查询最高分失败:', err.message)
          reject(err)
        } else {
          if (row) {
            console.log(`✅ 当前最高分: ${row.name} - ${row.score}分`)
          } else {
            console.log('✅ 暂无分数记录')
          }
          resolve(row || { score: 0, name: null })
        }
      }
    )
  })
}

module.exports = {
  initDatabase,
  getDb,
  addScore,
  getAllScores,
  getHighestScore
}
