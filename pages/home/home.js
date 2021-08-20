//index.js
//获取应用实例
import { httpReq } from "../../utils/http";
const app = getApp();
let QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
let qqmapsdk;
let date = new Date();
let currentDay = date.getDate();
let hours = date.getHours();
let title = '';
if (hours < 6) {
  title = '凌晨';
} else if (hours < 11) {
  title = '上午';
} else if (hours < 14) {
  title = '中午';
} else if (hours < 18) {
  title = '下午';
} else {
  title = '晚上';
}

Page({
  data: {
    status: '',
    url: "",
    link: "",
    enable: false,
    hoursTitle: '',
    hoursTip: '',
    scrollIndex: 0,
    scrollTop: 0, //设置竖向滚动条位置
    downYear: 0, //下拉年分
    downMonth: 0, //下拉月分
    upYear: 0, //下拉年分
    upMonth: 0, //下拉月分
    stopLoadMoreTiem: false, //上拉下拉状态
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
    isTodayShow: true,
    todayIndex: 0,
    hidden: true
  },
  onUserLogin() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  onAdd() {
    let _that = this;
    if (_that.data.isLogin) {
      wx.navigateTo({
        url: '../add/add?from=2',
      })
    } else {
      _that.goUserLogin();
    }
  },
  onDateil(e) {
    let _that = this;
    if (e.currentTarget.dataset.datenum == 0) {
      return false;
    }
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1 < 10 ? `0${nowDate.getMonth() + 1}` : nowDate.getMonth() + 1;
    let nowDay = nowDate.getDate() < 10 ? `0${nowDate.getDate()}` : nowDate.getDate();
    
    let nowTime = `${nowYear}${nowMonth}${nowDay}`; 
    let data = e.currentTarget.dataset;
    let detailDay = data.datenum < 10 ? `0${data.datenum}` : data.datenum;
    let detailMonth = data.month < 10 ? `0${data.month}` : data.month;
    let detailDate = `${data.year}${detailMonth}${detailDay}`;
    if (parseInt(detailDate) > parseInt(nowTime)) {
      wx.showToast({
        title: '哎呀，时间还没到呢',
        icon: 'none'
      })
    } else {
      if (_that.data.isLogin) {
        if (data.type === undefined) {
          wx.navigateTo({
            url: `../add/add?from=2&year=${data.year}&month=${data.month}&day=${data.datenum}`,
          })
        } else {
          wx.navigateTo({
            url: `../detail/detail?from=1&year=${data.year}&month=${data.month}&day=${data.datenum}`,
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
  // 外链
  goBaidu() {
    let _that = this;
    wx.navigateTo({
      url: `../out/out?link=${_that.data.link}`,
    })
  },
  // 回到今天
  onGotoDay(e) {
    let _that = this;
    _that.setData({
      status: e.currentTarget.dataset.id
    })
  },
  // 滚动条的信息
  onChangeScroll: function (event) {
    let _that = this;
    let curTime = new Date();
    let curTimeY = curTime.getFullYear();
    let curTimeM = curTime.getMonth() + 1 < 10 ? `0${curTime.getMonth() + 1}` : curTime.getMonth() + 1;
    let curTimeD = `${curTimeY}${curTimeM}`
    const query = wx.createSelectorQuery();
    query.select(`#goto${curTimeD}`).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      let scorlltop = res[0].top;
      if (scorlltop < -100 || scorlltop > 500) {
        _that.setData({
          isTodayShow: false
        })
      } else {
        _that.setData({
          isTodayShow: true
        })
      }
    })
  
  },
  bindDateChange: function (e) {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let selectYear = e.detail.value.split('-')[0];
    let newMonth = e.detail.value.split('-')[1];
    wx.navigateTo({
      url: `../calendar/calendar?year=${selectYear}&month=${newMonth}`,
    })
    this.setData({
      startDate: `${year}-${month}`
    })
  },
  onLoad: function () {
    let date = new Date();
    let year = date.getFullYear();
    let downmonth = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    this.setData({
      allDate: [],
      userInfo: wx.getStorageSync('userInfo'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      hoursTitle: '',
      downYear: year, //下拉年分
      downMonth: downmonth, //下拉月分
      upYear: year, //上拉年分
      upMonth: month, //上拉月分
      currenYear: year,
      currenMonth: `${year}${month}`,
      endDate: `${parseInt(year+9)}-${12}`,
      startDate: `${year}-${month}`,
      year,
      month,
      isToday: `${year}${month}${day}`,
      toView: `goto${year}${month}`
    })
    this.downInit(this.data.downYear,this.data.downMonth);
    this.init(this.data.upYear, this.data.upMonth);
    this.getTitleData();
    let e = {
      currentTarget :{
        dataset: {
          id: `goto${this.data.currenMonth}`
        }
      }
    }
    let _that = this;
    setTimeout(function() {
      _that.onGotoDay(e);
    },400)
  },
  // 
  onShow: function () {
    this.setData({
      isLogin: wx.getStorageSync('isLogin'),
    })
  },
  // 顶部下拉 down
  bindscrolltoupper: function (e) {
    let startM = this.data.downMonth - 1 < 10 ? `0${this.data.downMonth - 1}` : `${this.data.downMonth - 1}`;
    let upperDate = `${this.data.downYear}${startM}`;
    if ( this.data.stopLoadMoreTiem) {
      return;
    }
    if (upperDate < 200001) {
      wx.showToast({
        title: '暂无数据',
      })
    } else {
      // if (this.data.isLogin) {
        wx.showLoading({
          title: '数据加载中...',
          mask: true
        })
      // }
      this.downInit(this.data.downYear, this.data.downMonth - 1, 'xiala');
    }
  },
  // 底部上拉 up
  bindscrolltolower: function (e) {
    let nowTimes = new Date();
    let nowYears = nowTimes.getFullYear();
    let startM = this.data.upMonth - 1 < 10 ? `0${this.data.upMonth - 1}` : `${this.data.upMonth - 1}`;
    let upperDate = `${this.data.upYear}${startM}`;
    let nowDates = `${parseInt(nowYears + 9)}12`;
    if ( this.data.stopLoadMoreTiem ) {
      return;
    }
    if (parseInt(upperDate) >= parseInt(nowDates)) {
      wx.showToast({
        title: '暂无数据',
      })
    } else {
      this.init(this.data.upYear, this.data.upMonth + 1, 'up');
    }
  },
    // 顶部下拉 down2
  downInit(year, month, type) {
    let m = 0;
    let newM = 12;
    let monthArray = [];
    for (let i = 0; i < 6; i++) {
      if (parseInt(month- i)  <= 0) {
        m = newM--;
        this.setData({
          downYear: year - 1
        })
      } else {
        m = parseInt(month - i) ;
      }
      this.dateInit(this.data.downYear, m, 'down');
      let m2 = m < 10 ? `0${m}` : m
      monthArray.push(`${this.data.downYear}${m2}`);
    }
    this.setData({
      downMonth: m
    })
    this.getCalendar(monthArray, type);
  },
    // 底部上拉 up2
  init(year, month, type) {
    let m = 0;
    let newM = 0;
    let monthArray = [];
    for (let i = 0; i < 6; i++) {
      if (parseInt(month, 10) + i > 12) {
        m = 0;
        newM++;
        m = newM;
        this.setData({
          upYear: parseInt(year + 1)
        })
      } else {
        m = parseInt(month, 10) + i
      }
      this.dateInit(this.data.upYear, m, 'up');
      let m2 = m < 10 ? `0${m}` : m
      monthArray.push(`${this.data.upYear}${m2}`);
    }
    this.setData({
      upMonth: m
    })
    // if (type != 'up') {
      this.getCalendar(monthArray);
    // }
  },

  dateInit: function (setYear, setMonth, type) {
    let _that = this;
    //需要遍历的日历数组数据
    let dateArr = [];
    //dateArr的数组长度                      
    let arrLen = 0;
    let year = setYear;
    //方便后面计算当月总天数
    let month = setMonth;
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
          leftIndex: startWeek,
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
          leftIndex: startWeek,
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
    
    if (type == 'up') {
      _that.data.allDate.push(dateArr);
      _that.setData({
        // allDate: _that.data.allDate,
        // stopLoadMoreTiem: false
      })
    } else {
      _that.data.allDate.unshift(dateArr);
    }
    
  },
  // 获取日历数据
  getCalendar: function (months, type) {
    let _that = this;
    let isLogin = wx.getStorageSync('isLogin');
    _that.setData({
      stopLoadMoreTiem: true
    })
    if (isLogin) {
      httpReq({
        url: `/v1/record/listMonths`,
        method: 'POST',
        data: {
          userId: wx.getStorageSync('userInfo').userId,
          months: months
        },
      }).then( res => {
        let data1 = [];
        let data2 = [];
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
          for (let i2 in item) {
            for (let index in data2) {
              if (data2[index].hasOwnProperty(item[i2].allDay.day)) { 
                item[i2].allDay.basic = data2[index][item[i2].allDay.day].basic;
              }
            }
          }
        }
        for(let i in _that.data.allDate) {
          let item = _that.data.allDate[i];
          for(let i2 in item) {
            for(let index in data2) {
              if (data2[index].hasOwnProperty(item[i2].allDay.day)) {
                // 前一天有记录type
                let lType = [];
                for (let k in item[parseInt(i2) - 1].allDay.basic) {
                  lType.push(item[parseInt(i2) - 1].allDay.basic[k].record.type);
                }
                // 后一天记录type
                let nType = [];
                for (let k2 in item[parseInt(i2) + 1].allDay.basic) {
                  nType.push(item[parseInt(i2) + 1].allDay.basic[k2].record.type);
                }
                for(let k2 in item[i2].allDay.basic) {
                  let itemType = item[i2].allDay.basic[k2].record.type
                  if(lType.indexOf(itemType) > -1 && nType.indexOf(itemType) > -1){
                    item[i2].allDay.basic[k2].record.isStatus = 3;
                  }
                  if(lType.indexOf(itemType) == -1 && nType.indexOf(itemType) > -1){
                    item[i2].allDay.basic[k2].record.isStatus = 1;
                  }
                  if(lType.indexOf(itemType) > -1 && nType.indexOf(itemType) == -1){
                    item[i2].allDay.basic[k2].record.isStatus = 2;
                  }
                  if(lType.indexOf(itemType) == -1 && nType.indexOf(itemType) == -1){
                    item[i2].allDay.basic[k2].record.isStatus = 0;
                  }
                }
              }
            }
          }
        }
        _that.setData({
          allDate: _that.data.allDate,
          stopLoadMoreTiem: false
        },()=>{
          if (type == 'xiala') {
            _that.queryMultipleNodes(months);
            wx.hideLoading();
          }
        })
      }).catch( err=> {
        wx.showToast({
          title: '加载失败，请重新请求',
        })
        _that.setData({
          stopLoadMoreTiem: false
        })
        wx.hideLoading();
      })
    } else {
      _that.setData({
        allDate: _that.data.allDate,
        stopLoadMoreTiem: false
      },()=>{
        if (type == 'xiala') {
          _that.queryMultipleNodes(months);
          wx.hideLoading();
        }
      })
    }
  },
  // 获取公共配置
  getTitleData() {
    let _that = this;
    httpReq({
      url: `/v1/common/config`,
      method: 'POST',
    }).then( res => {
      let data = res.data;
      _that.setData({
        url: data.banner.url,
        link: data.banner.link,
        enable: data.banner.enable
      })
      switch(title){
        case '凌晨':
          _that.setData({
            hoursTitle: data.凌晨.substring(0,3),
            hoursTip: data.凌晨.substring(4)
          });
          break;
        case '上午': 
          _that.setData({
            hoursTitle: data.上午.substring(0,3),
            hoursTip: data.上午.substring(4)
          });
          break;
        case '中午':
          _that.setData({
            hoursTitle: data.中午.substring(0,3),
            hoursTip: data.中午.substring(4)
          });
          break;
        case '下午':
          _that.setData({
            hoursTitle: data.下午.substring(0,3),
            hoursTip: data.下午.substring(4)
          });
          break;
        case '晚上':
          _that.setData({
            hoursTitle: data.晚上.substring(0,3),
            hoursTip: data.晚上.substring(4)
          });
          break;
      }
    }).catch( err => {

    })
  },
  // 获取传入年月的节点信息
  queryMultipleNodes: function(months){
    let _that = this;
    let query = wx.createSelectorQuery();
    query.select(`#goto${months[0]}`).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function(res){
      _that.setData({
        scrollTop: res[0].top
      })
    })
  }
})