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
        if (res.data.success) {
          this.setData({
            scores: res.data.data || [],
            loading: false
          })
        }
      },
      fail: (err) => {
        console.log('获取分数失败', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
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
