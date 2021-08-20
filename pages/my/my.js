// pages/my/my.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    link: 'https://www.ido360.cn/tip.html'
  },
  // 用户登录
  onUserLogin() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  onSet() {
    wx.navigateTo({
      url: '../my/set/set',
    })
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      isLogin: wx.getStorageSync('isLogin')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onUpdate() {
    wx.navigateTo({
      url: '../updatePassword/updatePassword',
    })
  },
  onPricacy(e) {
    let _that = this;
    wx.navigateTo({
      url: `../out/out?link=${_that.data.link}`,
    })
  },
  onAbout(e) {
    wx.navigateTo({
      url: '../my/about/about',
    })
  }
})