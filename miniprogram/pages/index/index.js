// var util = require('../../util/util.js')
var dataRange = require('../../util/date.js')
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowForm: false,
    isShowCover: true,
    orderInfo: {},
    realname: '',
    phone: '',
    address: '',
    openid: '',
    activity_id: '',
    projectIndex: 0,
    sexIndex: 0,
    projectArray: [],
    multiArray: [
      [],
      ['上午', '下午']
    ],
    currentYear: 0,
    currentMonth: 0,
    currentDay: 0,
    multiIndex: [0, 0],
    sexArray: [{
      _id: 0,
      name: '先生'
    }, {
      _id: 1,
      name: '女士'
    }],
    nowDate: '',
    showAdminEntry: 0,
    activityData: []
  },

  getAppBasicInfo: function () {
    let that = this
    app.getBasicInfo().then(function (info) {
      that.setData({
        'multiArray[0]': info[0].date,
        'currentYear': info[0].year,
        'currentMonth': info[0].nowDate.month,
        'currentDay': info[0].nowDate.day,
        'projectArray': info[1],
        'nowDate': info[0].year.toString() + info[0].nowDate.month.toString() + info[0].nowDate.day.toString()
      })
      that.getActivity()
    })
  },

  getAuthInfo: function (e) {
    let that = this
    app.getOpenId().then(function (re) {
      that.setData({
        openid: re.openid
      })
    })
  },

  getActivity: function () {
    const db = wx.cloud.database()
    const _ = db.command
    let that = this
    db.collection('activity').get({
      success: res => {
        // this.setData({
        //   activityList: res.data
        // })
        //是否过期，按层级排序
        let list = res.data
        let arr = []
        list.forEach(function (item) {
          let date = that.data.currentYear + '-' + that.data.currentMonth + '-' + that.data.currentDay
          // let condition = that.data.currentYear>=starttime[0]&&that.data.currentYear<=endtime[0]&&that.data.currentMonth>=starttime[1]&&that.data.currentMonth<=endtime[1]&&that.data.currentDay>=starttime[2]&&that.data.currentDay<=endtime[2]
          // if(condition){
          //   return item
          // }
          // arr.push(item)
          // console.log(arr)
          let condition = dataRange.isDateBetween(date, item.startdate, item.enddate)
          if (condition) {
            arr.push(item)
          }
        })
        console.log(arr)
        if (arr.length > 1) {
          arr = arr.sort(function (a, b) {
            return parseInt(a.level) - parseInt(b.level)
          })
        }
        that.setData({
          activityData: arr,
          isShowCover: true,
          isShowForm: false
        })
      },
      fail: err => {
        this.setData({
          isShowCover: false,
          isShowForm: true
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  getPhoneNumber: function (e) {},

  onGotUserInfo: function(e) {
    console.log(e)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    if(e.detail.userInfo){
      this.setData({
        isShowCover: false,
        isShowForm: true,
        activity_id: e.currentTarget.dataset.id
      })
    }
  },

  bindSexChange: function (e) {
    this.setData({
      sexIndex: e.detail.value
    })
  },

  bindProjectChange: function (e) {
    this.setData({
      projectIndex: e.detail.value
    })
  },

  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
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

  formSubmit: function (e) {
    let that = this
    if (e.detail.value.realname !== '' && e.detail.value.phone !== '') {
      const db = wx.cloud.database()
      let data = {
        // order_id:that.data.currentYear+that.data.multiArray[0][e.detail.value.date[0]]+e.detail.value.project,
        order_id: that.data.nowDate + e.detail.value.project + that.randomNum(10001, 100000),
        realname: e.detail.value.realname,
        phone: e.detail.value.phone,
        address: e.detail.value.address,
        sex_id: that.data.sexArray[e.detail.value.sex]._id,
        preject_id: that.data.projectArray[e.detail.value.project]._id,
        bookdate: [that.data.currentYear, that.data.multiArray[0][e.detail.value.date[0]], that.data.multiArray[1][e.detail.value.date[1]]],
        createtime: db.serverDate(),
        updatetime: db.serverDate(),
        usedTime: null,
        isActive: 0,
        usedtime: db.serverDate(),
        remark: e.detail.value.remark,
        activity_id: that.data.activity_id
      }
      db.collection('order').add({
        data: data,
        success: function (res) {
          wx.showToast({
            title: '预约成功，跳转中...',
            icon: 'success',
            duration: 2000,
            success: function () {
              wx.switchTab({
                url: '/pages/usercenter/index?id=' + res._id
              })
            }
          })
        },
        fail: console.error
      })
    } else {
      wx.showToast({
        title: '请输入名字和联系方式',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let that = this
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      this.getAuthInfo()
    }
    this.getAppBasicInfo()
    if (options.method == 'manager' && options.status == '1') {
      this.setData({
        showAdminEntry: 1
      })
    }
    // this.getActivity()
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

  }
})