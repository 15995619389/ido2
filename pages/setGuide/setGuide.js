// pages/setGuide/setGuide.js
import { httpReq } from '../../utils/http.js'
let COS = require('../../libs/cos-wx-sdk-v5.js')
let app = getApp();
let ageList = [];
let durationList = [];
let newHours = [];
let newMinutes = [];
let hours = [];
let minutes = [];
for (let i = 1; i<=99; i++) {
  durationList.push(i);
}
for (let i = 0; i<=99; i++) {
  ageList.push(i);
}
let nowtime = new Date();
let hh = nowtime.getHours();
let mm = nowtime.getMinutes();
for (let i=0; i<24; i++) {
  newHours.push(i)
}
for (let i=0; i<60; i++) {
  newMinutes.push(i)
}
for (let i=0; i<=hh; i++) {
  hours.push(i)
}
for (let i=0; i<=mm; i++) {
  minutes.push(i)
}
var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数
    httpReq({
      url: `/v1/common/upload`,
      data: {
        bucket: params.Bucket,
        region: params.Region
      },
      method: 'POST',
    }).then( res => {
      let data = res.data;
      callback({
        TmpSecretId: data.TmpSecretId,
        TmpSecretKey: data.TmpSecretKey,
        XCosSecurityToken: data.Token,
        StartTime: data.StartTime,
        ExpiredTime: data.ExpiredTime
      })
    }).catch( err => {

    })
  }
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: 0,
    type: 0,
    durationVal: 29,
    duration: 30,
    location: '',
    code: '',
    idea: '',
    time: '',
    cosData: {
      SecretId: '',
      SecretKey: '',
      Region: '',
      FileName: '',
      Dir: '',
      Bucket: '',
      Token: '',
      AppId: ''
    },

    curDate: '',
    age: 20,
    h: 0,
    m: 0,
    durationList: durationList,
    ageList: ageList,
    UploadImgs: [],
    
    isTimeShow: true,
    isAgeShow: false,
    isDurationShow: false,
    isDayShow: false,
    isLoading: false
  },
  onChangeDate(e) {
    let now = new Date();
    let year = now.getFullYear();  //年
    let month = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1; //月
    let day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
    let currentYearMonthDay = `${year}-${month}-${day}`
    this.setData({ 
      time: e.detail.value,
      hours: newHours,
      minutes: newMinutes,
      isTimeShow: false,
      isDayShow: false 
    });
  },
  onChangeAge(e) {
    this.setData({
      age: e.detail.value,
      isAgeShow: false
    })
  },
  onChangeDuration(e) {
    for(let index in durationList) {
      if (e.detail.value == index) {
        this.setData({
          duration: durationList[index],
          isDurationShow: false
        })
        break;
      }
    }
  },
  onTextAreaBlur(e) {
    this.setData({ idea:e.detail.value });
  },
  onUploadImg(e) {
    let _that = this;
    _that.getCosData();
    let len=0;
    //获取当前已有的图片
    if (_that.data.UploadImgs!=null){
      len = _that.data.UploadImgs.length;
    }
    wx.chooseImage({
      count: 9-len, //默认9
      sizeType: ['compressed'],
      success: (res)=> {
        let filePath = [];
        filePath = res.tempFilePaths;
        for(let i=0; i< filePath.length; i++) {
          wx.showLoading({
            title: '图片正在上传中...',
            make: true
          })
          var Key = filePath[i].substr(filePath[i].lastIndexOf(".") + 1);
          cos.postObject({
            Bucket: _that.data.cosData.Bucket,
            Region: _that.data.cosData.Region,
            Key: `${_that.data.cosData.Dir}/${_that.data.cosData.FileName}${i}.${Key}`,
            FilePath: filePath[i],
            onProgress: function (info) {
              console.log(JSON.stringify(info));
            }
          }, function (err, data) {
            if (err && err.error){
              wx.showToast({
                title: "上传失败，请重试",
                icon: 'none'
              })
              wx.hideLoading();
            } else if (err) {
              wx.showToast({
                title: "上传失败，请重试",
                icon: 'none'
              })
              wx.hideLoading();
            } else {
              if(data.statusCode==200){
                _that.data.UploadImgs.push(data.Location);
                _that.setData({
                  UploadImgs: _that.data.UploadImgs
                })
                wx.hideLoading();
              }
            }
          });
        }
      },
      complete: (res) => {
      },
    })
  },
  getCosData(data) {
    let _that = this;
    httpReq({
      url: `/v1/common/upload`,
      method: 'POST'
    }).then( res => {
      let data = res.data;
      _that.setData({
        cosData: {
          SecretId: data.TmpSecretId,
          SecretKey: data.TmpSecretKey,
          Region: data.Region,
          FileName: data.FileName,
          Dir: data.Dir,
          Bucket: data.Bucket,
          Token: data.Token,
          AppId: data.AppId
        }
      })
    }).catch( err => {

    })
  },
  onRemoveImg(e) {
    let _that = this;
    for (let index in _that.data.UploadImgs) {
      if (_that.data.UploadImgs[index] == e.target.dataset.url) {
        _that.data.UploadImgs.splice(index, 1);
      }
    }
    _that.setData({
      UploadImgs: _that.data.UploadImgs
    })
  },
  onPreviewImage(e) {
    let current = e.target.dataset.src;
    wx.previewImage({
      current,
      urls: this.data.UploadImgs,
    })
  },
  onChangeStatus(e) {
    this.setData({
      type: e.currentTarget.dataset.index
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let currentAddress = this.data.location != '' ? this.data.location : wx.getStorageSync('currentAddress');
    let now = new Date();
    let year = now.getFullYear();  //年
    let month = now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1; //月
    let day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();   //日
    let curDate = `${year}-${month}-${day}`;
    let h = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();       //获取当前小时数(0-23)
    let m = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();     //获取当前分钟数(0-59)
    let hh = now.getHours(); //获取当前小时数(0-23)
    let mm = now.getMinutes(); //获取当前分钟数(0-59)
    this.setData({
      location: currentAddress,
      hours: newHours,
      minutes: newMinutes,
      curTime: curDate,
      h,
      m,
      curDate: curDate
    }) 
    
    if (this.data.age == 20) {
      this.setData({
        isAgeShow: true
      })
    }
    if (this.data.duration == 30) {
      this.setData({
        isDurationShow: true
      })
    }
    if (this.data.curTime = curDate) {
      this.setData({
        isDayShow: true
      })
    }
    this.setData({
      timevalue: [hh, mm],
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
    let currentProvince = wx.getStorageSync('province');
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1]; // 当前页
    // 从上一页回来的数据
    this.setData({
      location: currPage.data.address
    })
    if (currPage.data.address == '不显示位置') {
      this.setData({
        code: ''
      })
    } else {
      httpReq({
        url: `/v1/record/province`,
        method: 'POST'
      }).then( res => {
        let data = res.data.List;
        let autogegion = data.autogegion;
        let municipality = data.municipality;
        let province = data.province;
        let specialregion = data.specialregion;
        let provinceList = [...autogegion, ...municipality, ...province, ...specialregion];
        for (let index in provinceList) {
          if (currentProvince == provinceList[index].fullname) {
            _that.setData({ code: provinceList[index].id });
            break;
          }
        }
      }).catch( err => {

      })
    }
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
  onRouter() {
    wx.reLaunch({
      url: '../home/home',
    })
  },
  onGoto() {
    wx.navigateTo({
      url: '../addressList/addressList',
    })
  },
  onOpenModel(e) {
    this.setData({
      isTimeShow: false
    })
  },
  fnbindChange(e) {
    this.setData({
      timevalue: [e.detail.value[0], e.detail.value[1]]
    })
  },
  confirmTime(e) {
    let _that = this;
    let nowD = new Date();
    let curY = nowD.getFullYear();
    let curM = nowD.getMonth()+1 < 10 ? `0${parseInt(nowD.getMonth()+1)}` : parseInt(nowD.getMonth()+1) ;
    let curD = nowD.getDate() < 10 ? `0${nowD.getDate()}` : nowD.getDate();
    let curH = nowD.getHours() < 10 ? `0${nowD.getHours()}` : nowD.getHours();
    let curMM = nowD.getMinutes() < 10 ? `0${nowD.getMinutes()}` : nowD.getMinutes();

    let dataY = _that.data.time.split('-')[0];
    let dataM = _that.data.time.split('-')[1];
    let dataD = _that.data.time.split('-')[2];
    let dataH = _that.data.timevalue[0] < 10 ? '0' + _that.data.timevalue[0] : _that.data.timevalue[0];
    let dataMM = _that.data.timevalue[1] < 10 ? '0' + _that.data.timevalue[1] : _that.data.timevalue[1];
    let curData = `${curY}${curM}${curD}${curH}${curMM}`;
    let eventData = `${dataY}${dataM}${dataD}${dataH}${dataMM}`;
    if (parseInt(eventData) > parseInt(curData)) {
      wx.showToast({
        title: '哎呀，时间还没到呢',
        icon: 'none'
      })
    } else {
      _that.setData({
        h: dataH,
        m: dataMM,
        isTimeShow: true
      })
    }
  },
  closeTime(e) {
    this.setData({
      isTimeShow: true
    })
  },
  changeIsLoading(isLoading) {
    this.setData({isLoading: isLoading});
  },
  onSubmit() {
    let _that = this;
    let imgLists = [];
    for (let index in _that.data.UploadImgs) {
      let item =  _that.data.UploadImgs[index].split('woxing/');
      imgLists.push(`woxing/${item[1]}`);
    }
    _that.changeIsLoading(true);
    if (!_that.validate()){
      _that.changeIsLoading(false);
      return false;
    }
    let day = _that.data.time.replace(/-/g, '');
    let getTimes = _that.data.time.split('-');
    let data = {
      userId: wx.getStorageSync('userInfo').userId,
      type: _that.data.type,
      duration: _that.data.duration,
      location: _that.data.location,
      code: _that.data.code,
      idea: _that.data.idea,
      time: `${getTimes[0]}年${getTimes[1]}月${getTimes[2]}日 ${_that.data.h}:${_that.data.m}`,
      day: day,
      month: day.substring(0, 6),
      year: day.substring(0, 4),
      images: imgLists
    }
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    httpReq({
      url: `/v1/record/add`,
      data: data,
      method: 'POST',
    }).then( res => {
      _that.changeIsLoading(false);
      wx.hideLoading();
      if (res.code == 0) {
        wx.reLaunch({
          url: '../home/home',
        })
      } else {
        wx.showToast({
          title: '提交失败！',
          icon: 'none'
        })
      }
    }).catch( err => {
      _that.changeIsLoading(false);
      wx.hideLoading();
      wx.showToast({
        title: '提交失败！',
        icon: 'none'
      })
    })
  },
  validate() {
    let isTrue = true;
    if (this.data.type == 0) {
      wx.showToast({
        title: '请选择类型',
        icon: 'none'
      })
      isTrue = false;
    } else if (this.data.time == '') {
      wx.showToast({
        title: '请选择时间',
        icon: 'none'
      })
      isTrue = false;
    }
    return isTrue;
  }
 })