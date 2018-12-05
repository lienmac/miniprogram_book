function login() {
  return new Promise((resolve, reject) => wx.login({
    success: resolve,
    fail: reject
  }))
}

//获取用户信息
function getUserInfo() {
  return login().then(res => new Promise((resolve, reject) =>
    wx.getUserInfo({
      success: resolve,
      fail: reject
    })
  ))
}

function requstGet(url, data) {
  return requst(url, 'GET', data)
}

function requstPost(url, data) {
  return requst(url, 'POST', data)
}

//封装Request请求方法
function requst(url, method, data = {}) {
  wx.showNavigationBarLoading()
  data.method = method
  return new Promise((resove, reject) => {
    wx.request({
      url: url,
      data: data,
      header: {},
      method: method.toUpperCase(), // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        wx.hideNavigationBarLoading()
        resove(res.data)
      },
      fail: function (msg) {
        console.log('reqest error', msg)
        wx.hideNavigationBarLoading()
        reject('fail')
      }
    })
  })
}

//发布的接口
module.exports = {
  Promise,
  login,
  getUserInfo,
  get: requstGet,
  post: requstPost,
  requst
}