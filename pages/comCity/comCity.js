// pages/comCity/comCity.js
import { httpReq } from "../../utils/http";
let app = getApp();
let QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
let qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentProvince: '',
    selectProvince: '',
    cityTitle: ['直辖市', '省', '自治区', '特别行政区'],
    provinceList: {},
    setlectProvinceList: [],
    currentIndex: 0,
    province: '',
    latitude: '',
    longitude: '',
    cityShow: true,
    dateShow: true,
    isLocation: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: '4BVBZ-POJ3S-CZQOO-6TXQF-KC2XO-PUB75' //这里自己的key秘钥进行填充
    });
    let currentProvince = wx.getStorageSync('province') == '' ? '未开启定位' : wx.getStorageSync('province');
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let endTime = `${year}-${month}`;
    this.setData({
      isLogin: wx.getStorageSync('isLogin'),
      code: '310000',
      currentProvince,
      selectProvince: wx.getStorageSync('province'),
      isLocation: wx.getStorageSync('province') == '' ? true : false,
      year,
      month,
      endTime,
      dreamCount: 0,
      dreamPercent: 0,
      dreamTips: '',
      abstinenceCount: 0,
      partnerCount: 0,
      partnerPercent: 0,
      partnerTips: '',
      planeCount: 0,
      planePercent: 0,
      planeTips: '',
      total: 0
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
    this.onLoad();
    if (this.data.isLogin) {
      this.getCurrentProvince();
    }
  },
  getCurrentProvince() {
    let _that = this;
    _that.getUserLocation();
    let currentProvince = wx.getStorageSync('province');
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
      _that.setData({
        provinceList: data,
        setlectProvinceList: data.municipality
      })
      let newMonth = `${_that.data.year}${_that.data.month}`
      _that.getData(_that.data.code, newMonth);
    }).catch( err => {

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
  // 选择时间
  bindDateChange: function (e) {
    let _that = this;
    let selectYear = e.detail.value.substr(0, 4);
    let selectMonth = e.detail.value.substring(e.detail.value.length - 2);
    _that.setData({
      year: selectYear,
      month: selectMonth
    })
    let newMonth = `${_that.data.year}${_that.data.month}`
    _that.getData(_that.data.code, newMonth);
  },
  onOpenProvince() {
    // if (this.data.isLocation) {
    //   this.onCloseProvince();
    // } else {
      wx.hideTabBar();
      this.setData({
        cityShow: false
      })
    // }
  },
  onCloseProvince() {
    wx.showTabBar();
    this.setData({
      cityShow: true
    })
  },
  onClickCity(e) {
    this.setData({
      currentIndex: e.target.dataset.index
    })
    if (this.data.currentIndex == 0) {
      this.setData({
        setlectProvinceList: this.data.provinceList.municipality
      })
    } else if (this.data.currentIndex == 1) {
      this.setData({
        setlectProvinceList: this.data.provinceList.province
      })
    } else if (this.data.currentIndex == 2) {
      this.setData({
        setlectProvinceList: this.data.provinceList.autogegion
      })
    } else {
      this.setData({
        setlectProvinceList: this.data.provinceList.specialregion
      })
    }
  },
  // 判断用户是否授权获取位置信息
  getUserLocation: function () {
    let _that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            content: '打开系统定位，可获得当前省市位置',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权位置获取',
                  icon: 'none',
                  duration: 2000
                })
                // wx.navigateBack();
              } else if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'none',
                        duration: 2000
                      })
                      _that.getLocation();
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          _that.getLocation();
        } else {
          _that.getLocation();
        }
      }
    })
  },
  // 微信获取经纬度
  getLocation: function() {
    let _that = this;
    wx.getLocation({
      type: 'gcj02',
      altitude: 'true',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        _that.getLocal(latitude, longitude);
      },
      fail: function (res) {
      }
    })
  },
  // 获取当前地理位置
  getLocal: function(latitude, longitude) {
    let _that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        let province = res.result.ad_info.province;
        let currentAddress = res.result.address;
        _that.setData({
          selectProvince: province,
          currentProvince: province,
          province: province,
          latitude: latitude,
          longitude: longitude,
          isLocation: false
        })
        wx.setStorageSync('province', _that.data.province);
        wx.setStorageSync('currentAddress', currentAddress);
      }
    })
  },
  onSelectProvince(e) {
    let _that = this;
    _that.setData({
      code: e.currentTarget.dataset.item.id,
      selectProvince: e.currentTarget.dataset.item.fullname,
      isLocation: false
    })
    _that.onCloseProvince();
    let month = `${_that.data.year}${_that.data.month}`
    _that.getData(_that.data.code, month)
  },
  onSelectCurProvince() {
    let _that = this;
    let currentProvince = wx.getStorageSync('province');
    httpReq({
      url: `/v1/record/province`,
      method: 'POST',
    }).then( res => {
      let data = res.data.List;
      let autogegion = data.autogegion;
      let municipality = data.municipality;
      let province = data.province;
      let specialregion = data.specialregion;
      let provinceList = [...autogegion, ...municipality, ...province, ...specialregion];
      for (let index in provinceList) {
        if (currentProvince == provinceList[index].fullname) {
          _that.setData({ 
            code: provinceList[index].id,
            selectProvince: currentProvince
          });
          break;
        }
      }
      _that.setData({
        provinceList: data,
      })
      let newMonth = `${_that.data.year}${_that.data.month}`
      _that.getData(_that.data.code, newMonth);
    }).catch( err => {

    })
    this.onCloseProvince();
  },
  getData(code, month) {
    let _that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    httpReq({
      url: `/v1/record/city`,
      data: {
        userId: wx.getStorageSync('userInfo').userId,
        code: code,
        month: month
      },
      method: 'POST',
    }).then( res => {
      let data = res.data;
      if (JSON.stringify(data) !== "{}" ) {
        _that.setData({
          dreamCount: data.dreamCount === 'undefined' ? 0 : data.dreamCount,
          dreamPercent: data.dreamPercent === 'undefined' ? 0 : data.dreamPercent,
          dreamTips: data.dreamTips,
          partnerCount: data.partnerCount,
          partnerPercent: data.partnerPercent,
          partnerTips: data.partnerTips,
          planeCount: data.planeCount,
          planePercent: data.planePercent,
          planeTips: data.planeTips,
          total: data.total
        })
      } else {
        _that.setData({
          dreamCount: 0,
          dreamPercent: 0,
          dreamTips: '',
          partnerCount: 0,
          partnerPercent: 0,
          partnerTips: '',
          planeCount: 0,
          planePercent: 0,
          planeTips: '',
          total: 0
        })
      }
      wx.hideLoading();
    }).catch( err => {
      wx.hideLoading();
    })
  }
})