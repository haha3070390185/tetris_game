const api = require('../../../utils/api')

Page({
  data: {
    scores: [],
    loading: true,
    apiBaseUrl: ''
  },

  onLoad() {
    this.setData({
      apiBaseUrl: api.getBaseUrl()
    })
    this.loadScores()
  },

  onShow() {
    this.loadScores()
  },

  async loadScores() {
    this.setData({ loading: true })

    try {
      console.log('开始加载分数列表...')
      
      const result = await api.scores.getAll(100)
      
      console.log('API返回结果:', result)
      
      if (result && result.success) {
        this.setData({
          scores: result.data || [],
          loading: false
        })
        console.log(`成功加载 ${result.data ? result.data.length : 0} 条记录`)
      } else {
        this.setData({ loading: false })
        wx.showToast({
          title: result ? result.message : '获取数据失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载分数失败:', error)
      this.setData({ loading: false })

      const errorMsg = error.message || '未知错误'
      let detailMsg = `错误类型: ${error.type || 'network_error'}\n错误信息: ${errorMsg}\n\n`
      
      if (error.type === 'timeout') {
        detailMsg += '请求超时，请检查网络连接。'
      } else {
        detailMsg += '可能的原因：\n'
        detailMsg += '1. 后端服务未启动\n'
        detailMsg += '2. 开发者工具未勾选"不校验合法域名"\n'
        detailMsg += '3. 网络连接问题\n\n'
        detailMsg += `当前API地址: ${this.data.apiBaseUrl}`
      }

      wx.showModal({
        title: '连接服务器失败',
        content: detailMsg,
        confirmText: '刷新重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            this.loadScores()
          } else {
            wx.navigateBack()
          }
        }
      })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  refresh() {
    this.loadScores()
  }
})
