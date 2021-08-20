// pages/addressList/addressList.js
let app = getApp();
let QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
let qqmapsdk;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isStyle: false,
    page: 1,
    page_size: 20,
    subtitle: '加载中...',
    type: 'in_theaters',
    addressList: [],
    noAddress: '不显示位置',
    inputVal: '',
    province: '',
    city: '',
    latitude: '',
    longitude: '',
    hasMore: true,
    isItemShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: '4BVBZ-POJ3S-CZQOO-6TXQF-KC2XO-PUB75' //这里自己的key秘钥进行填充
    });
    let _that = this;
    let locationAuthorized = wx.getStorageSync('locationAuthorized');
    if (!locationAuthorized) {
      wx.showToast({
        title: '请开启设备定位',
        icon: 'none',
        duration: 3000
      })
    } else {
      this.getUserLocation();
    }
    _that.setData({
      locationAuthorized
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
    // this.getLocation();
    
   
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
    this.setData({ 
      addressList: [],
      page: 1, 
      hasMore: true 
    });
    let e = {
      detail: {
        value: this.data.inputVal
      }
    }
    this.onSearch(e);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const page = this.data.page++;
    this.setData({
      page: this.data.page
    })
    let e = {
      detail: {
        value: this.data.inputVal
      }
    }
    this.onSearch(e);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 判断用户是否授权获取位置信息
  getUserLocation: function () {
    let _that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            // title: '请求授权当前位置',
            content: '打开系统定位，可获得附近位置坐标',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 2000
                })
                wx.navigateBack();
              } else if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'none',
                        duration: 2000
                      })
                      _that.setData({
                        isItemShow: true
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
        var speed = res.speed
        var accuracy = res.accuracy;
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
      // coord_type: 1,
      // get_poi: 1,
      // poi_options: 'policy=2;radius=5000;page_size=20;page_index=1',
      success: function(res) {
        let province = res.result.ad_info.province;
        let city = res.result.ad_info.city;
        _that.setData({
          province: province,
          city: city,
          latitude: latitude,
          longitude: longitude,
          inputVal: res.result.address
        })
        wx.setStorageSync('province', _that.data.province);
        wx.setStorageSync('currentAddress', _that.data.inputVal);
        let e = {
          detail: {
            value: _that.data.inputVal
          }
        }
        _that.onSearch(e);
      }
    })
  },
  // 输入获取地址list
  onSearch: function(e) {
    const _that = this;
    _that.setData({
      inputVal: e.detail.value == '' ? wx.getStorageSync('currentAddress') : e.detail.value,
    });
    qqmapsdk.search({
      keyword: _that.data.inputVal,
      page_index: _that.data.page,
      page_size: _that.data.page_size,
      success: function(res) {
        let totalPage = Math.ceil(parseInt(res.count) / _that.data.page_size);
        if (_that.data.page >= totalPage) {
          _that.setData({
            addressList: res.data,
            hasMore: false
          })
        } else {
          _that.setData({
            addressList: _that.data.addressList.concat(res.data),
            hasMore: true
          })
        }
      }
    })
  },
  onSearchFocues(e) {
    const _that = this;
    _that.setData({
      inputVal: e.detail.value == '' ? wx.getStorageSync('currentAddress') : e.detail.value,
      page: 1,
      addressList: []
    });
    // if (_that.data.inputVal.length <= 0) {
    //   this.setData({
    //     hasMore: false
    //   })
    //   return ;
    // }
    qqmapsdk.search({
      keyword: _that.data.inputVal,
      page_index: _that.data.page,
      page_size: _that.data.page_size,
      success: function(res) {
        if (res.data.length > 0) {
          _that.setData({
            addressList: _that.data.addressList.concat(res.data)
          })
        } else {
          _that.setData({
           hasMore: false
          })
        }
        let totalPage = Math.ceil(parseInt(res.count) / _that.data.page_size);
        if (_that.data.page >= totalPage) {
          _that.setData({
            hasMore: false
          })
        } else {
          _that.setData({
            hasMore: true
          })
        }
      }
    })
  },
  // 获取滚动条当前位置
  onPageScroll:function(e){ 
    if (e.scrollTop > 0) {
      this.setData({
        isStyle: true
      })
    } else {
      this.setData({
        isStyle: false
      })
    }
  },
  onSelectAdd(e) {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length-2] // 上一页// 调用上一个页面的setData 方法，将数据存储
    prevPage.setData({
      address: e.currentTarget.dataset.address
    })
    wx.navigateBack({
      delta: 1
    })
  }
})