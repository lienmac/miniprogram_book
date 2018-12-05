//app.js

App({
  onLaunch: function (options) {
    // let that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.getAuthInfo()
  },
  globalData: {
    projectArray: [],
    openid: '',
    isManager: 0
  },

  getAuthInfo: function (e) {
    let that = this
    that.getOpenId().then(function (re) {
      that.globalData.openid = re.openid
      that.isExistManager(that.globalData.openid)
    })
  },

  isExistManager: function (OPENID) {
    const db = wx.cloud.database()
    const _ = db.command
    let that = this
    db.collection('admin').where({
        _openid: _.eq(OPENID)
      })
      .get({
        success: function (res) {
          if (res.data.length > 0) {
            that.globalData.isManager = 1
          }
          // console.log(that.globalData)
        }
      })
  },

  getOpenId: function () {
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          resolve(res.result)
        },
        fail: err => {
          console.error('[云函数] [sum] 调用失败：', err)
          reject(err)
        }
      })
    })
  },

  getBasicInfo: function () {
    var p1 = this.getDateList()
    var p2 = this.getProjects()
    return Promise.all([p1, p2])
  },
  getDateList: function () {
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'time',
        data: {
          day: 60
        },
        success: res => {
          resolve(res.result)
        },
        fail: err => {
          console.error('[云函数] [sum] 调用失败：', err)
          reject(err)
        }
      })
    })
  },
  getProjects: function () {
    return new Promise(function (resolve, reject) {
      const db = wx.cloud.database()
      db.collection('projects').get({
        success: function (res) {
          resolve(res.data)
        }
      })
    })

  }

})