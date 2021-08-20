const app = getApp();

export function httpReq(params) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: `${app.globalData.https}${params.url}`,
      method: params.method,
      data: params.data, 
      header: {
        token: wx.getStorageSync('otherInfo').token
      },
      success: (res) => {
        if (res.statusCode == 200) {
          resolve(res.data);
        }   
      },
      fail: (res) => {
        reject(res.data);
      }
    });
  });
}