// pages/detail/detail.js
let app = getApp();
import { httpReq } from '../../utils/http.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    statusconetntHeight: app.globalData.statusBarHeight + 45,
    toView: '',
    detailList: [],
    isDelete: false,
    isShow: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let newMonth = options.month < 10 ? `0${options.month}` : options.month;
    let newDay = options.day < 10 ? `0${options.day}` : options.day;
    this.setData({
      toView: `detail${options.year}${newMonth}${newDay}`,
      year: options.year,
      optionsMonth: options.month,
      optionsDay: options.day,
      from: options.from,
      month: newMonth
    })
    
    this.getData();
    let _that = this;
    setTimeout(function() {
      let query = wx.createSelectorQuery();
      query.select(`#${_that.data.toView}0`).boundingClientRect();
      //这段代码的意思是获取页面滑动位置的查询请求
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        wx.pageScrollTo({
          scrollTop: res[0].top - _that.data.statusconetntHeight,
          duration: 1000
        })
      })
    },500)
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
  onGoback() {
    let _that = this;
    if (_that.data.from == 1) {
      if (_that.data.isDelete) {
        wx.reLaunch({ //reLaunch
          url: '../home/home',
        })
      } else {
        wx.switchTab({ //switchTab
          url: '../home/home',
        })
      }
    } else {
      wx.navigateBack({     //返回上一页面或多级页面
        delta:1
      })
    }
  },
  onPreviewImage(e) {
    let currentImg = e.target.dataset.src;
    let currentImgList = [];
    for (let index in e.target.dataset.list) {
      currentImgList.push(e.target.dataset.list[index].url)
    }
    wx.previewImage({
      current: currentImg,
      urls: currentImgList,
    })
  },
  onUpdate(e) {
    let data = e.target.dataset;
    let imgs = [];
    if (data.images.length > 0 ){
      for (let index in data.images) {
        imgs.push(data.images[index].url)
      }
    }
    wx.navigateTo({
      url: `../update/update?recordId=${data.recordid}&type=${data.type}&duration=${data.duration}&location=${data.location}&code=${data.code}&idea=${data.idea}&time=${data.time}&images=${JSON.stringify(imgs)}`,
    })
  },
  onDelete(e) {
    let _that = this;
    wx.showModal({
      title: '删除',
      content: '您确认要删除该条记录吗？',
      success(res) {
        if (res.confirm) {
          httpReq({
            url: '/v1/record/del',
            data: {
              ids: [e.target.dataset.id]
            },
            method: 'POST',
          }).then( res => {
            _that.getData();
            _that.setData({
              isDelete: true
            })
          }).catch( err => {
            screenXwx.showToast({
              title: '删除失败！',
              icon: 'none'
            })
          })
        }
      }
    })
  },
  onAdd() {
    let _that = this;
    wx.navigateTo({
      url: `../add/add?from=1&year=${_that.data.year}&month=${_that.data.optionsMonth}&day=${_that.data.optionsDay}`,
    })
  },
  getData() {
    let _that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    httpReq({
      url: '/v1/record/detail',
      data: {
        userId: wx.getStorageSync('userInfo').userId,
        month: `${_that.data.year}${_that.data.month}`
      },
      method: 'POST',
    }).then( res => {
      let now = new Date();
      let curY = now.getFullYear();
      let curM = now.getMonth()+1 < 10 ? `0${now.getMonth()+1}`: `${now.getMonth()+1}`;
      let curD = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
      let curTime = `${curY}${curM}${curD}`;
      let data = res.data;
      let dataArray = [];
      let getData = [];
      for(let i in data.list){
        dataArray.push(data.list[i])
      }
      for (let index in dataArray) { 
        for (let index2 in dataArray[index].basic) {
          if (dataArray[index].basic[index2].record.day == curTime) {
            let timeTitle = dataArray[index].basic[index2].record.time.split(' ')[1];
            dataArray[index].basic[index2].record.timeTitle = `今天 ${timeTitle}`
          } else {
            let timeTitle = dataArray[index].basic[index2].record.time.substring(5, dataArray[index].basic[index2].record.time.length)
            dataArray[index].basic[index2].record.timeTitle = timeTitle;
          }
          dataArray[index].basic[index2].record.nodeId = `${dataArray[index].basic[index2].record.day}${index2}`
        }
      }
      for (let k in dataArray) {
        for (let k2 in dataArray[k].basic) {
          getData.push(dataArray[k].basic[k2])
        }
      }
      getData.sort(function(item,item2){
        return item2.record.day - item.record.day
      })
      _that.setData({
        detailList: getData
      })
      wx.hideLoading();
    }).catch( err=> {
      wx.showToast({
        title: '加载失败...',
        icon: 'none'
      })
      wx.hideLoading();
    })
  }
})