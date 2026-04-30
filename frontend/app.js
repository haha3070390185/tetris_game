App({
  onLaunch() {
    console.log('萌系俄罗斯方块小程序启动')
  },
  
  globalData: {
    userInfo: null,
    apiBaseUrl: 'http://localhost:3000/api'
  }
})
