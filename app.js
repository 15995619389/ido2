//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    // 登录
    this.loading();
    wx.getSystemInfo({
      success:( res=>{
        wx.setStorageSync('locationAuthorized', res.locationAuthorized);
      })
    })
    wx.setStorageSync('isDev', false);
    wx.setStorageSync('isLogin', false);
    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
  },
  
  loading(type) {
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          that.globalData.wxCode = res.code;
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    that.globalData.userInfo = res.userInfo;
                    that.globalData.alluserData = res;
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    wxCode: null,
    openId: '',
    userInfo: null,
    alluserData: null,
    https:  wx.getStorageSync('isDev') == true ? 'http://202.61.85.246:10001' : 'https://api.ido360.cn',
    statusBarHeight:wx.getSystemInfoSync()['statusBarHeight']
  }
})