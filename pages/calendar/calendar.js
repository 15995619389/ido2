//index.js
//获取应用实例
const app = getApp();
import { httpReq } from "../../utils/http";
let QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
let qqmapsdk;
let date = new Date();
let currentDay = date.getDate();
let hours = date.getHours();

Page({
  data: {
    allDate: [],
    listModel: [],
    httpMonth: [],
    indexDate: 0,
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0
  },
  onAdd() {
    wx.navigateTo({
      url: '../add/add?from=2',
    })
  },
  onDateil(e) {
    let _that = this;
    if (e.currentTarget.dataset.datenum == 0) {
      return false;
    }
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowDay = nowDate.getDate() < 10 ? `0${nowDate.getDate()}` : nowDate.getDate();
    
    let nowTime = `${nowYear}${nowMonth}${nowDay}`; 
    let data = e.currentTarget.dataset;
    let detailDay = data.datenum < 10 ? `0${data.datenum}` : data.datenum;
    let detailDate = `${data.year}${data.month}${detailDay}`;
    let isLogin = wx.getStorageSync('isLogin');
    if (parseInt(detailDate) > parseInt(nowTime)) {
      wx.showToast({
        title: '哎呀，时间还没到呢',
        icon: 'none'
      })
    } else {
      if (isLogin) {
        if (data.type === undefined) {
          wx.navigateTo({
            url: `../add/add?year=${data.year}&month=${data.month}&day=${data.datenum}`,
          })
        } else {
          wx.navigateTo({
            url: `../detail/detail?from=2&year=${data.year}&month=${data.month}&day=${data.datenum}`,
          })
        }
      } else {
        _that.goUserLogin();
      }
    }
  },
  // 用户是否需要登录弹窗
  goUserLogin() {
    wx.showModal({
      title: '授权登录',
      content: '请先登录再进行操作',
      cancelText: '暂不登录',
      confirmText: '立即登录',
      success: (res)=>{
        if (res.confirm) {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      }
    })
  },
  bindDateChange: function (e) {
    let selectYear = e.detail.value.substr(0, 4);
    let newMonth = e.detail.value.substring(e.detail.value.length - 2);
    this.setData({
      currenYear: selectYear,
      month: newMonth
    })
    this.dateInit(this.data.currenYear, parseInt( this.data.month, 10))
  },
  onLoad: function (options) {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    this.setData({
      currenYear: options.year,
      currenMonth: `${year}${month}`,
      endDate: `${parseInt(year + 9)}-12`,
      startDate: `${options.year}-${options.month}`,
      year,
      month: options.month,
      isToday: `${year}${month}${day}`
    })
  },
  onShow: function () {
    this.dateInit(this.data.currenYear, parseInt( this.data.month, 10))
  },
  dateInit: function (setYear, setMonth, type) {
    //需要遍历的日历数组数据
    let dateArr = [];
    //dateArr的数组长度                      
    let arrLen = 0;
    let year = setYear;
    //方便后面计算当月总天数
    let month = setMonth;
    // debugger
    //目标月1号对应的星期
    let startWeek = new Date(year ,(month -1) , 1).getDay();
    //获取目标月有多少天
    let dayNums = new Date(year, month, 0).getDate();
    let obj = {};
    let num = 0;
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      let monthStr = month < 10 ? `0${month}` : month;
      if (i >= startWeek) {
        num = i - startWeek + 1;
        let days = i - startWeek + 1 < 10 ? `0${i - startWeek + 1}` : i - startWeek + 1;
        let numStr = num < 10 ? `0${num}` : num;
        obj = {
          year: `${setYear}`,
          month: parseInt(month, 10),
          months: `${setYear}${monthStr}`,
          days: `${setYear}${monthStr}${numStr}`,
          allDay: {
            month: `${setYear}${monthStr}`,
            isToday: `${setYear}${monthStr}${numStr}`,
            dateNum: num,
            day: `${setYear}${monthStr}${days}`
          }
        }
      } else {
        obj = {
          year: `${setYear}`,
          month: parseInt(month, 10),
          months: `${setYear}${monthStr}`,
          allDay: {
            dateNum: 0
          }
        };
      }
      dateArr[i] = obj;
    }
    let _that = this;
    let httpM = setMonth < 10 ? `0${setMonth}` : setMonth;
    _that.setData({
      allDate: dateArr
    })
    let isLogin = wx.getStorageSync('isLogin');
    if (isLogin) {
      _that.getCalendar([`${setYear}${httpM}`])
    }
  },
  // 获取日历数据
  getCalendar: function (months) {
    let _that = this;
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })
    httpReq({
      url: `/v1/record/listMonths`,
      data: {
        userId: wx.getStorageSync('userInfo').userId,
        months: months
      },
      method: 'POST'
    }).then( res => {
      let data1 = []
      let data2 = []
      let data = res.data;
      for (let index in data.list) {
        data1.push(data.list[index])
      }
      for (let index2 in data1) {
        for (let index3 in data1[index2]) {
          data2.push(data1[index2].list)
        }
      }
      for (let i in data2) {
        let item = data2[i];
        for (let k in item) {
          for (let j in item[k].basic) {
            item[k].basic[j].record.isStatus = 0;
          }
        }
      }
      for (let i in _that.data.allDate) {
        let item = _that.data.allDate[i];
        for (let index in data2) {
          if (data2[index].hasOwnProperty(item.allDay.day)) { 
            item.allDay.basic = data2[index][item.allDay.day].basic;
          }
        }
      }
      for(let i in _that.data.allDate) {
        let item = _that.data.allDate[i];
          for(let index in data2) {
            if (data2[index].hasOwnProperty(item.allDay.day)) {
              // 前一天有记录type
              let lType = [];
              for (let k in _that.data.allDate[[parseInt(i) - 1]].allDay.basic) {
                lType.push(_that.data.allDate[[parseInt(i) - 1]].allDay.basic[k].record.type);
              }
              // 后一天记录type
              let nType = [];
              for (let k2 in _that.data.allDate[parseInt(i) + 1].allDay.basic) {
                nType.push(_that.data.allDate[parseInt(i) + 1].allDay.basic[k2].record.type);
              }
              for(let k2 in item.allDay.basic) {
                let itemType = item.allDay.basic[k2].record.type
                if(lType.indexOf(itemType) > -1 && nType.indexOf(itemType) > -1){
                  item.allDay.basic[k2].record.isStatus = 3;
                }
                if(lType.indexOf(itemType) == -1 && nType.indexOf(itemType) > -1){
                  item.allDay.basic[k2].record.isStatus = 1;
                }
                if(lType.indexOf(itemType) > -1 && nType.indexOf(itemType) == -1){
                  item.allDay.basic[k2].record.isStatus = 2;
                }
                if(lType.indexOf(itemType) == -1 && nType.indexOf(itemType) == -1){
                  item.allDay.basic[k2].record.isStatus = 0;
                }
              }
            }
          }
      }
      _that.setData({
        allDate: _that.data.allDate
      })
      wx.hideLoading();
    }).catch( err => {
      wx.hideLoading();
      wx.showToast({
        title: '网络异常，请重新请求',
      })
    })
  }
})