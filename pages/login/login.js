// pages/login/login.js
const app = getApp();
import { httpReq } from "../../utils/http";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openId: '',
    source: 1,
    nickName: '',
    icon: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  // 登录
  bindGetUserInfo: function (e) {
    let that = this;
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '登录中...',
        mask: true
      })
      let isLogin = wx.getStorageSync('isLogin');
      if (isLogin) {
        wx.hideLoading();
        wx.navigateTo({
          url: `../newPassword/newPassword`,
        })
      } else {
        that.getUnionid(e);
      }
    } else {
      wx.reLaunch({
        url: '../home/home',
      })
    }
  },
  // 获取用户信息接口
  getUnionid: function(e) {
    let that = this;
    httpReq({
      url: `/v1/weixin/auth`,
      data: {
        jscode: app.globalData.wxCode,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      method: 'POST',
    }).then( res => {
      let isDirect = res.data.isDirect;
      let userUnionId = null;
      if (!isDirect) {
        userUnionId = JSON.parse(res.data.unionid);
      }
      app.globalData.openId = isDirect ?  res.data.unionid : userUnionId.unionId;
      wx.setStorageSync('avatarUrl', e.detail.userInfo.avatarUrl);
      httpReq({
        url: `/v1/user/login`,
        method: 'POST',
        data: {
          "thirdPartyInfo":{
            "openId": app.globalData.openId,
            "source": that.data.source
          },
          "userInfo":{
            "nickName": e.detail.userInfo.nickName,
            "icon": e.detail.userInfo.avatarUrl,
            "openId": app.globalData.openId
          }
        },
        method: 'POST',
      }).then( res => {
        let data = res.data;
        wx.setStorageSync('userInfo', data.userInfo);
        wx.setStorageSync('otherInfo', data.otherInfo);
        wx.setStorageSync('isLogin', true);
        wx.navigateTo({
          url: `../newPassword/newPassword`,
        })
        wx.hideLoading();
      }).catch( err => {
        wx.hideLoading();
      })
    }).catch( err => {
      wx.hideLoading();
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    })
  }

})