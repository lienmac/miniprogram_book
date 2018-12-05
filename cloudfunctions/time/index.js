// 云函数入口函数
function getDay(day) {
  var today = new Date();
  var targetday_milliseconds
  var tYear
  var tMonth
  var tDate
  var arr = []
  // for(var i=0;i<day;i++){
  targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
  today.setTime(targetday_milliseconds); //注意，这行是关键代码
  // tYear = today.getFullYear();
  tMonth = today.getMonth();
  tDate = today.getDate();
  tMonth = doHandleMonth(tMonth + 1);
  tDate = doHandleMonth(tDate);
  // arr.push(tMonth + "-" + tDate)
  // }

  return tMonth + "-" + tDate;
}

function getAllDay(day) {
  var arr = []
  for (var i = 0; i < day; i++) {
    arr.push(getDay(i))
  }
  return arr
}

function doHandleMonth(month) {
  var m = month;
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  return m;
}

function getNowYear() {
  let date = new Date()
  let year = date.getFullYear()
  return year
}

function getNowMonthDay() {
  let date = new Date()
  let month = date.getMonth()
  let m = parseInt(month)+1
  let day = date.getDate()
  let d = day
  let w = date.getDay()
  if (month.toString().length == 1) {
    m = "0" + month;
  }
  if (day.toString().length == 1) {
    d = "0" + day;
  }
  return {
    "month":m,
    "day":d,
    "week":w
  };
}


// function getNow() {
//   let date = new Date()
//   let month = date.getMonth()
//   let day = date.getDate()
//   return doHandleMonth(tMonth + 1) + '-' + day
// }

exports.main = (event, context) => {
  // console.log(event)
  // console.log(context)
  return {
    date: getAllDay(event.day),
    year: getNowYear(),
    nowDate: getNowMonthDay()
  }
}