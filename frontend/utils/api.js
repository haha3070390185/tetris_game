const app = getApp()

const BASE_URL = 'http://localhost:3000/api'

const DEFAULT_TIMEOUT = 10000

function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    timeout = DEFAULT_TIMEOUT
  } = options

  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

    console.log(`[API] ${method} ${fullUrl}`, data)

    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: timeout,
      success: (res) => {
        console.log(`[API] 响应 ${fullUrl}:`, res)

        const statusCode = res.statusCode

        if (statusCode === 200) {
          if (res.data && res.data.success) {
            resolve(res.data)
          } else {
            console.warn(`[API] 业务失败:`, res.data)
            resolve(res.data)
          }
        } else if (statusCode === 400) {
          reject({
            type: 'bad_request',
            message: res.data ? res.data.message : '请求参数错误',
            statusCode
          })
        } else if (statusCode === 500) {
          reject({
            type: 'server_error',
            message: res.data ? res.data.message : '服务器内部错误',
            statusCode
          })
        } else {
          reject({
            type: 'unknown',
            message: `请求失败，状态码: ${statusCode}`,
            statusCode
          })
        }
      },
      fail: (err) => {
        console.error(`[API] 请求失败:`, err)

        let errorType = 'network_error'
        let message = '网络连接失败'

        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorType = 'timeout'
            message = '请求超时，请检查网络连接'
          } else if (err.errMsg.includes('fail')) {
            message = '无法连接到服务器，请确保后端服务已启动'
          }
        }

        reject({
          type: errorType,
          message: message,
          original: err
        })
      }
    })
  })
}

function get(url, data = {}) {
  return request({
    url,
    method: 'GET',
    data
  })
}

function post(url, data = {}) {
  return request({
    url,
    method: 'POST',
    data
  })
}

const scoresApi = {
  getAll(limit = 100) {
    return get('/scores', { limit })
  },

  getHighest() {
    return get('/scores/high')
  },

  submit(name, score) {
    return post('/scores', {
      name: String(name).trim(),
      score: parseInt(score)
    })
  }
}

const healthApi = {
  check() {
    return get('/health')
  }
}

function showErrorModal(error) {
  let content = error.message || '发生未知错误'

  if (error.type === 'timeout') {
    content = '请求超时，请检查网络连接后重试。\n\n确保后端服务已启动：\n1. 打开命令行\n2. 进入 backend 目录\n3. 运行: npm start'
  } else if (error.type === 'network_error') {
    content = '无法连接到服务器。\n\n可能的原因：\n1. 后端服务未启动\n2. 网络连接问题\n3. 开发者工具未勾选"不校验合法域名"'
  }

  wx.showModal({
    title: '提示',
    content: content,
    showCancel: false,
    confirmText: '我知道了'
  })
}

function getBaseUrl() {
  return BASE_URL
}

module.exports = {
  request,
  get,
  post,
  scores: scoresApi,
  health: healthApi,
  showErrorModal,
  getBaseUrl
}
