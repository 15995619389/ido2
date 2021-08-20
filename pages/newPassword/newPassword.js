// pages/main/index.js
var wxlocker = require("../../utils/wxlocker.js");
Page({
  data:{
    isSetPassword: 1,
    title:'请设置手势密码',
    resetHidden:false,
    type: 0,
    titleColor:""
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
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
    var type = wxlocker.lock.type
    this.setData({
      resetHidden: resetHidden,
      title: title,
      titleColor: titleColor,
      isSetPassword: isSetPassword,
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
    let isOneSetPwd = wx.getStorageSync('isOneSetPwd');
    if (type == 1) {
      setTimeout(function() {
        wx.reLaunch({
          url: '../home/home',
        })
      }, 1000)
    } else {
      wx.setStorageSync('isOneSetPwd', 'false');
      setTimeout(function() {
        wx.navigateTo({
          url: '../guide/guide',
        })
      }, 1000)
    }
  },
  lockreset:function(){
    wx.setStorageSync('isOneSetPwd', 'false');
    wxlocker.lock.updatePassword(2);
    this.initState();
  }
})