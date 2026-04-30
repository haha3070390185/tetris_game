const app = getApp()

Page({
  data: {
    
  },

  onLoad() {
    console.log('首页加载完成')
  },

  startGame() {
    wx.navigateTo({
      url: '/pages/game/game'
    })
  },

  viewLeaderboard() {
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    })
  }
})
