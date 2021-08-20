// pages/main/index.js
let app = getApp();
var wxlocker = require("../../utils/wxlocker2.js");
Page({
  data:{
    statusBarHeight: app.globalData.statusBarHeight,
    statusconetntHeight: app.globalData.statusBarHeight + 45,
    isSetPassword: 1,
    title:'请设置手势密码',
    pwdTitle: '验证您的手势密码',
    resetHidden:false,
    type: 0,
    status: 0,
    titleColor:""
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let updatePass = wx.getStorageSync('passwordxx');
    if (updatePass == '') {
      wx.setStorageSync('passwordxx', wx.getStorageSync('updatePassword'));
    }
    wxlocker.lock.init();
    this.initState();
  },
  onReady:function(){
    
  },
  onShow:function(){
    
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
    // this.setData({
    //   isSetPassword: 0
    // })
  },

  onUnload:function(){
    // 页面关闭

  },
  //设置提示语与重置按钮
  initState:function(){
    var resetHidden = wxlocker.lock.resetHidden;
    var title = wxlocker.lock.title;
    var titleColor = wxlocker.lock.titleColor;
    var isSetPassword = wxlocker.lock.isSetPassword;
    var pwdTitle = wxlocker.lock.pwdTitle;
    var status = wxlocker.lock.status;
    var type = wxlocker.lock.type
    this.setData({
      resetHidden: resetHidden,
      title: title,
      titleColor: titleColor,
      pwdTitle: pwdTitle,
      status: status,
      type: type
    });
  },
  touchS:function(e){//touchstart事件绑定
    wxlocker.lock.bindtouchstart(e);
  },
  touchM:function(e){//touchmove事件绑定
    wxlocker.lock.bindtouchmove(e);
  },
  touchE:function(e){//touchend事件绑定
    wxlocker.lock.bindtouchend(e,this.lockSetSucc);
    wxlocker.lock.bindtouchend(e,this.lockSucc);
    this.initState();
  },
  lockSetSucc:function(type) {//密码设置成功的回调函数
    if (type == 1) {
      wx.switchTab({
        url: '../my/my',
      })
      wx.showToast({
        title: '手势设置成功',
        icon: 'none'
      })
    } else {
      wxlocker.lock.updatePassword(1);
    }
  },
  lockreset:function(){
    wx.showModal({
      title: '提示',
      content: '重新登录设置手势密码',
      cancelText: '否',
      cancelColor: '#000000',
      confirmText: '是',
      confirmColor: '#4dc0ff',
      success(res) {
        if (res.confirm) {
          wxlocker.lock.updatePassword(1);
          wx.setStorageSync('isOneSetPwd', 'false');
          wx.reLaunch({
            url: '../login/login'
          })
        }
      }
    })
    // this.initState();
  }
})