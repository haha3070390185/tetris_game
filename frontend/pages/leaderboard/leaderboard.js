const app = getApp()

Page({
  data: {
    scores: [],
    loading: true
  },

  onLoad() {
    this.loadScores()
  },

  onShow() {
    this.loadScores()
  },

  loadScores() {
    this.setData({ loading: true })
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/scores`,
      method: 'GET',
      success: (res) => {
        console.log('获取分数响应:', res.data)
        if (res.data && res.data.success) {
          this.setData({
            scores: res.data.data || [],
            loading: false
          })
        } else {
          this.setData({ loading: false })
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.log('获取分数失败:', err)
        this.setData({ loading: false })
        wx.showModal({
          title: '网络连接失败',
          content: '无法连接到服务器。请确保后端服务已启动：\n\n1. 打开命令行\n2. 进入 backend 目录\n3. 运行: npm install && npm start',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    })
  },

  goBack() {
    wx.navigateBack()
  },

  refresh() {
    this.loadScores()
  }
})
