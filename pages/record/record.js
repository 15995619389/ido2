// pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    times: 0,
    tips: '',
    day: '2020-07-01',
    isCurrentWeek: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      times: options.total,
      count: options.count,
      tips: options.tips,
      day: options.day
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
    let _that = this;
    _that.setData({
      isCurrentWeek: this.SameWeek(this.data.day)
    })
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
  SameWeek(date) {    
    //将传入的时间字符串转换成时间对象   
    var date1 = new Date(date.replace(/-/g, "/"));
    //当前时间    
    var date2 = new Date();     
    //获取当前星期几    
    var curWeek = date2.getDay();    
    //计算出星期一    
    var monday = this.GetDate((curWeek), 1); 
    //计算出星期天 
    var sunday = this.GetDate((7 - curWeek), 2); 
    if (date1.getTime() < monday.getTime() || date1.getTime() > sunday.getTime()) {
      //不在同一个星期内         
      return false;          
    } else {        
      //在同一个星期内    
      return true;       
    }
    },
    GetDate(day, type) {    
      var zdate = new Date();    
      var edate;    
      if (type == 1) {        
        edate = new Date(zdate.getTime() - (day * 24 * 60 * 60 * 1000));    
      } else {        
        edate = new Date(zdate.getTime() + (day * 24 * 60 * 60 * 1000));   
      }    
      return edate;
    },
  goHome: function () {
    wx.reLaunch({
      url: '../home/home',
    })
  }
})