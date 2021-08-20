const app = getApp();

const config = {
  SecretId: '',
  SecretKey: '',
  Region: '',
  FileName: '',
  Dir: '',
  Bucket: '',
  Token: '',
  AppId: ''
}

wx.request({
  url: `${app.globalData.https}/v1/common/upload`,
  header: {
    token: wx.getStorageSync('otherInfo').token
  },
  method: 'POST',
  success(res) {
    if (res.statusCode == 200) {
      let data = res.data.data;
          config.SecretId = data.TmpSecretId,
          config.SecretKey = data.TmpSecretKey,
          config.Region = data.Region,
          config.FileName = data.FileName,
          config.Dir = data.Dir,
          config.Bucket = data.Bucket,
          config.Token = data.Token,
          config.AppId = data.AppId
    }
  }
})

module.exports = config