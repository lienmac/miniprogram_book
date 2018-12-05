// miniprogram/pages/activity/list/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: [],
    openid: ''
  },

  redirectAdd: function (){
    wx.navigateTo({
      url: '/pages/activity/edit/index'
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

  previewImage: function (e) {
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接
      urls: [e.target.dataset.src] // 需要预览的图片http链接列表
    })
  },

  getActivityList:function(){
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('activity').get({
      success: res => {
        this.setData({
          activityList: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    if (app.globalData.openid) {
      that.setData({
        openid: app.globalData.openid
      })
    } else {
      that.getAuthInfo()
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
  onShow: function () {
    this.getActivityList()
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