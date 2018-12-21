// miniprogram/pages/activity/edit/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    aid: '',
    tempImg: '',
    activity: {
      imgsrc: '',
      name: '',
      rule: '',
      startdate: '',
      enddate: '',
      number: 0,
      level: 1,
      isOpen: false
    },
    index: 0,
    levelList: [1, 2, 3],
    nowDate: ''
  },

  chooseImage: function () {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        // console.log(res)
        const tempFilePaths = res.tempFilePaths
        that.setData({
          'activity.imgsrc': tempFilePaths
        })
      },
      fail(err) {
        console.log(err)
      }
    });
  },

  previewImage: function () {
    let that = this
    wx.previewImage({
      current: that.data.activity.imgsrc, // 当前显示图片的http链接
      urls: that.data.activity.imgsrc // 需要预览的图片http链接列表
    })
  },

  bindStartDateChange: function (e) {
    this.setData({
      'activity.startdate': e.detail.value
    })
  },

  bindEndDateChange: function (e) {
    this.setData({
      'activity.enddate': e.detail.value
    })
  },

  bindLevelChange: function (e) {
    this.setData({
      'index': e.detail.value,
      'activity.level': e.detail.value
    })
  },

  switchChange: function (e) {
    this.setData({
      'activity.isOpen': e.detail.value
    })
  },

  randomNum: function (minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10);
        break;
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        break;
      default:
        return 0;
        break;
    }
  },

  uploadImg: function (CALL) {
    let that = this
    app.getBasicInfo().then(function (info) {
      console.log(info)
      that.setData({
        'nowDate': info[0].year.toString() + info[0].nowDate.month.toString() + info[0].nowDate.day.toString()
      })
      wx.cloud.uploadFile({
        cloudPath: 'img' + that.data.nowDate + that.randomNum(10001, 100000) + '.jpg', // 上传至云端的路径
        filePath: that.data.activity.imgsrc[0], // 小程序临时文件路径
        success: res => {
          // 返回文件 ID
          // console.log(res.fileID)
          CALL(res.fileID)
        },
        fail: console.error
      })
    })
  },

  getData: function (id) {
    const db = wx.cloud.database()
    let that = this
    db.collection('activity').doc(id).get({
      success: function (res) {
        // res.data 包含该记录的数据
        console.log(res.data)
        that.setData({
          activity: res.data,
          index:parseInt(res.data.level)-1
        })
      }
    })
  },

  addData: function (e) {
    let that = this
    that.uploadImg(function (FILEID) {
      const db = wx.cloud.database()
      let activity = {
        imgsrc: FILEID,
        name: e.detail.value.name,
        rule: e.detail.value.rule,
        startdate: e.detail.value.startdate,
        enddate: e.detail.value.enddate,
        number: 0,
        level: that.data.levelList[that.data.index],
        isOpen:that.data.activity.isOpen
      }
      db.collection('activity').add({
        data: activity,
        success: function (res) {
          wx.showToast({
            title: '活动创建成功，跳转中...',
            icon: 'success',
            duration: 2000,
            success: function () {
              wx.redirectTo({
                url: '/pages/activity/list/index?id=' + res._id
              })
            }
          })
          console.log(res)
        },
        fail: console.error
      })
    })
  },

  updateData: function (e) {
    console.log(e)
    const db = wx.cloud.database()
    let that = this
    if (that.data.activity.imgsrc.indexOf('cloud://') > -1) {
      //普通更新
      db.collection('activity').doc(that.data.aid).update({
        data: {
          // 表示将 done 字段置为 true
          imgsrc: that.data.activity.imgsrc,
          name: e.detail.value.name,
          rule: e.detail.value.rule,
          startdate: e.detail.value.startdate,
          enddate: e.detail.value.enddate,
          number: that.data.activity.number,
          level: that.data.levelList[that.data.index],
          isOpen:that.data.activity.isOpen
        },
        success: function (res) {
          wx.showToast({
            title: '活动修改成功，跳转中...',
            icon: 'success',
            duration: 2000,
            success: function () {
              wx.redirectTo({
                url: '/pages/activity/list/index?id=' + res._id
              })
            }
          })
        },
        fail: console.error
      })
    } else {
      //先上传图片再更新
      that.uploadImg(function (FILEID) {
        db.collection('activity').doc(that.data.aid).update({
          data: {
            imgsrc: FILEID,
            name: e.detail.value.name,
            rule: e.detail.value.rule,
            startdate: e.detail.value.startdate,
            enddate: e.detail.value.enddate,
            number: that.data.activity.number,
            level: that.data.levelList[that.data.index],
            isOpen:that.data.activity.isOpen
          },
          success: function (res) {
            wx.showToast({
              title: '活动修改成功，跳转中...',
              icon: 'success',
              duration: 2000,
              success: function () {
                wx.redirectTo({
                  url: '/pages/activity/list/index?id=' + res._id
                })
              }
            })
          },
          fail: console.error
        })
      })
    }
  },

  formSubmit: function (e) {
    if (this.data.aid == '') {
      this.addData(e)
    } else {
      this.updateData(e)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.id) {
      this.setData({
        aid: options.id
      })
      this.getData(options.id)
    } else {
      this.setData({
        aid: '',
        activity: {
          imgsrc: '',
          name: '',
          rule: '',
          startdate: '',
          enddate: '',
          number: 0,
          level: 1
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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

  }
})