const app = getApp()
var sliderWidth = 96;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageShowStatus: 0,
    bookList: [],
    bookList_notused: [],
    bookList_used: [],
    bookList_outdate: [],
    projectArray: [],
    dateArray: [],
    sexArray: [{
      _id: 1,
      name: '先生'
    }, {
      _id: 2,
      name: '女士'
    }],
    currentYear: 0,
    openid: '',
    tabs: ["未使用", "使用记录", "已过期"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    managerList: [{
      url: '',
      imgsrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAOVBMVEUAAADUI3nVI3rTI3nUInnUI3nTInrVIHrfIIDTIHjUInnUI3rWI3nUInrTI3nUInnTInrXIHjUI3o0K4zSAAAAEnRSTlMAoGDA0L/vMBBAcLBQ4K+PgCAk3lIBAAAAkElEQVQ4y7XNuxLDIAxE0cWAbQHOQ///sWmYbCHJThFvxXDuAG6YpDr33DxftOS5QzfP0/e8Hyn0UesC5By5aOnaGJj3ewFSmYHxMKBDtD74hXVg5NwwA+McA7oN6E7QfeftuPD0o78vHE3PHUPFdS6v26ljLyzocUG3BT0u6LagRwU9KITuF7rS3bWX4P/7AGpPBaO3kcKDAAAAAElFTkSuQmCC',
      name: '优惠活动'
    }, {
      url: '',
      imgsrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAOVBMVEUAAADVInrUIHjTI3nTInnUI3nVI3rXIHjUInnfIIDUInrUInrWI3nUInnVIHrUInnUInrTInrUI3qntUfIAAAAEnRSTlMAf0DA8L9gIOAQn5BQcDDQz29BLRJQAAAA3klEQVQ4y72SSY6EMAxFcfzJyPjvf9juggYHJb0olVRvgy0/HCvx8D28WOwktILSYqF7Fl0ZR3C8idzGvFfd2WW7hQjXHhEypyun9mZwlIdQ1ASvSyM0vCdE6ZAroU8lrK5LaGZoMWGp/wkZJPKjg1anejKqRnKvBC8v3FnHcckT6E0wAhHO9Uhg6AiF/noaz9IRImx/EJshL12PTHkLRV/4WyhHZkLFSou5np+tFoTzFc6Uv4XOcrEPCVjO+gKkI0hKIw0TIb+FJLCtDI8XdCBjJOGGf0izAjqf/T/nB+DnDa8qXTt2AAAAAElFTkSuQmCC',
      name: '会员预约'
    }],
    isManager: 0
  },

  getAppBasicInfo: function () {
    let that = this
    app.getBasicInfo().then(function (info) {
      // console.log(info)
      that.setData({
        'dateArray': info[0].date,
        'currentYear': info[0].year,
        'projectArray': info[1]
      })
      that.getAllBookList()
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

  outDate: function (userTime) {
    var list = this.data.dateArray.map(function (cur) {
      return cur == userTime
    })
    return list.join('').indexOf('true')
  },

  getBookList: function () {
    let that = this
    const db = wx.cloud.database()
    const _ = db.command
    console.log(that.data.openid)
    // 查询当前用户所有的 counters
    db.collection('order').where({
      _openid: _.eq(that.data.openid)
    }).get({
      success: res => {
        let bookList = []
        let finObj = {}
        let isOutDate = 0
        for (let i = 0; i < res.data.length; i++) {
          finObj = that.data.projectArray.find(function (o) {
            return o._id == res.data[i].preject_id;
          })
          isOutDate = that.outDate(res.data[i].bookdate[1])
          bookList.push({
            ...res.data[i],
            prejectname: finObj.name,
            isOutDate: isOutDate
          })
        }
        this.setData({
          bookList: bookList
        })
        this.getList(bookList)
        // console.log('[数据库] [查询记录] 成功: ', bookList)
        // let sorted = this.groupBy(bookList, function (item) {
        //   return [item.isActive];
        // });
        // let sorted2 = this.groupBy(bookList, function (item) {
        //   return [item.isOutDate];
        // });


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

  getAllBookList: function () {
    let that = this
    const db = wx.cloud.database()
    const _ = db.command
    console.log(that.data.openid)
    // 查询当前用户所有的 counters
    db.collection('order').get({
      success: res => {
        let bookList = []
        let finObj = {}
        let isOutDate = 0
        for (let i = 0; i < res.data.length; i++) {
          finObj = that.data.projectArray.find(function (o) {
            return o._id == res.data[i].preject_id;
          })
          isOutDate = that.outDate(res.data[i].bookdate[1])
          bookList.push({
            ...res.data[i],
            prejectname: finObj.name,
            isOutDate: isOutDate
          })
        }
        this.setData({
          bookList: bookList
        })
        this.getList(bookList)
        // console.log('[数据库] [查询记录] 成功: ', bookList)
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

  getList: function (BOOKLIST) {
    let sorted = this.groupBy(BOOKLIST, ['isActive'])

    let unActiveList = []
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].key == '0') {
        unActiveList = [].concat(sorted[i].value)
      } else {
        this.setData({
          'bookList_used': sorted[i].value
        })
      }
    }
    let sorted1 = this.groupBy(unActiveList, ['isOutDate'])
    console.log(sorted1)
    for (var j = 0; j < sorted1.length; j++) {
      if (parseInt(sorted1[j].key) > -1) {
        // unActiveList = sorted1[j].value
        this.setData({
          'bookList_notused': sorted1[j].value
        })
      } else {
        this.setData({
          'bookList_outdate': sorted1[j].value
        })
      }
    }
  },

  // groupBy: function (array, f) {
  //   // debugger;
  //   const groups = {};
  //   array.forEach(function (o) {
  //     const group = JSON.stringify(f(o));
  //     groups[group] = groups[group] || [];
  //     groups[group].push(o);
  //   });
  //   console.log(groups)
  //   return Object.keys(groups).map(function (group) {
  //     return groups[group];
  //   });
  // },

  groupBy: function (itemlist, gby) {

    var setGroupObj = function (noteObj, rule, gby, gIndex, maxIndex) {
      var gname = rule[gby[gIndex]];
      if (gIndex == maxIndex) {
        if (noteObj[gname] == undefined)
          noteObj[gname] = [];
        if (noteObj[gname].indexOf(rule) < 0) {
          noteObj[gname].push(rule);
        }
      } else {
        if (noteObj[gname] == undefined) {
          noteObj[gname] = {};
        }
        setGroupObj(noteObj[gname], rule, gby, gIndex + 1, maxIndex);
      }
    }

    var noteObj = {};
    for (var i = 0; i < itemlist.length; i++) {
      setGroupObj(noteObj, itemlist[i], gby, 0, gby.length - 1);
    }

    var getSubInfo = function (note, p, gIndex, maxIndex) {
      var newobj = {}
      newobj.key = p;
      newobj.value = [];
      if (gIndex == maxIndex) {
        for (var k in note) {
          newobj.value.push(note[k]);
        }
      } else {
        for (var k in note[p]) {
          newobj.value.push(getSubInfo(note[p][k], k, gIndex + 1, maxIndex));
        }
      }
      return newobj;
    }
    var myobj = [];
    for (var p in noteObj) {
      myobj.push(getSubInfo(noteObj[p], p, 0, gby.length - 1));
    }
    return myobj;
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  bindCancelBook: function(e){
    wx.showModal({
      title: '是否取消',
      content: '点击确定后将无法进行此次预约',
      success(res) {
        if (res.confirm) {
          console.log(e.currentTarget.dataset.id)
          const db = wx.cloud.database()
          db.collection('order').doc(e.currentTarget.dataset.id).update({
            data: {
              isCancel: 1
            },
            success(res) {
              console.log(res.data)
              wx.showToast({
                title: '已经取消此次预约',
                icon: 'success',
                duration: 2000
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
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
    if (that.data.pageShowStatus == 0) {
      that.getAppBasicInfo()
      that.data.pageShowStatus = 1
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.setData({
      isManager: app.globalData.isManager
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
    if (this.data.pageShowStatus == 1) {
      this.getAllBookList()
    }
    // console.log(app.globalData.isManager)
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