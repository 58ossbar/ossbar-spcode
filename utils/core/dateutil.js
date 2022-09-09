const stringUtil = require("stringutil.js");
const globaldata = require("globaldata.js");
function DateUtil(){}

/** year 是否 是闰年  */
DateUtil.prototype.isLeapYear = function(year){
  return (year % 4 == 0 && year % 100 != 0) || year % 400 ==0;
}


/** 解决苹果手机 new Date(currTime) currTime格式为yyyy-mm-dd hh:MM的情况下结果为null的问题 */
DateUtil.prototype.newDateFormateIOS = function(time){
  if (time && time.indexOf('-') > -1) {
    time = time.replace(/-/g, "/");
  }
  return time;
}
/**将 日期格式换成 消息的时间 显示
 * 如果是 【当天】 则显示   【时分】  例如：09:04
 * 如果是【昨天或者前天】 则显示   【昨天或者前天 时分】 例如： 昨天 09:04
 * 如果是【当年】  则显示 【月日 时分】 例如：8月20日 21:04
 * 如果不是【当年】  则显示 【年月日 时分】 例如：2019年8月20日 21:04
 * 如果该消息与上一条消息 没有 5分钟间隔 则不显示
 * currTime 当前消息时间
 * isCompare 是否比较时间
 * LastTime 上一条消息时间
 * splitor 分隔符，如果没有则是中文的年月日
 * isHasMinu  如果不是当天是否添加时分
 */
DateUtil.prototype.getMsgTime = function(currTime,isCompare=false,LastTime='',splitor='',isHasMinu = true){
  let result = '';
  currTime = DateUtil.prototype.newDateFormateIOS(currTime); // currTime.replace(/-/g, "/");
  LastTime = DateUtil.prototype.newDateFormateIOS(LastTime); // LastTime.replace(/-/g, "/");
  
  if(isCompare && LastTime && ( ( new Date(currTime).getTime() - new Date(LastTime).getTime() )  <= ((globaldata.operState.msgIntervalTime)*60*1000) ) ){
    result = '';
  }else{
    // new Date(currTime)  DateUtil.prototype.dateFromString
    var year = new Date(currTime).getFullYear()
    var month =  DateUtil.prototype.addZeroPrefix(new Date(currTime).getMonth()+1)
    var day = DateUtil.prototype.addZeroPrefix(new Date(currTime).getDate())
    var hour = DateUtil.prototype.addZeroPrefix(new Date(currTime).getHours())
    var minute = DateUtil.prototype.addZeroPrefix(new Date(currTime).getMinutes())
    var second = DateUtil.prototype.addZeroPrefix(new Date(currTime).getSeconds())

    if(DateUtil.prototype.isToday(currTime)){//是今天
      result = hour+':'+minute
    }else if(DateUtil.prototype.isLastDay(currTime,1)){//是昨天
      result = (!isHasMinu)?('昨天')  :(  '昨天 ' + hour + ':' + minute  ); 
    }else if(DateUtil.prototype.isLastDay(currTime,2)){//是前天
      result = (!isHasMinu)?('前天')  :(  '前天 ' + hour + ':' + minute  ); 
    }else if(DateUtil.prototype.isToYear(currTime)){//是当年
      if(splitor){
        result = month + splitor + day + ( (!isHasMinu)?'': (splitor+ hour+':'+minute) )  
      }else{
        result = (!isHasMinu)?( month+'月' +day+'日' )  :(  month+'月' +day+'日 '+ hour+':'+minute  ); 
        // result = month+'月' +day+'日 '+ hour+':'+minute
      }
    }else{
      if(splitor){
        result = year+ splitor + month + splitor + day + ( (!isHasMinu)?'': (splitor+ hour+':'+minute) ) 
      }else{
        result = (!isHasMinu)?( year+'年'+month+'月' +day+'日' )  :(  year+'年'+month+'月' +day+'日 '+ hour+':'+minute  ); 
        // result = year+'年'+month+'月' +day+'日 '+ hour+':'+minute
      }
    }
  }
  return result;
}

/**个位数 数字 前面追加0 */
DateUtil.prototype.addZeroPrefix = function(number) {
  return (((number || number==0) && number <10) ? '0' + number : number)
}
/**判断是否是当年 */
DateUtil.prototype.isToYear = function(date) {
  date = DateUtil.prototype.newDateFormateIOS(date); //  date.replace(/-/g, "/");
  return new Date(date).getFullYear() === new Date().getFullYear()
}
/**判断是否是昨天还是前天
 * num为1是昨天，num为2是前天
 */
DateUtil.prototype.isLastDay = function(date,num) {
  date = DateUtil.prototype.newDateFormateIOS(date); //  date.replace(/-/g, "/");
  var time = (new Date()).getTime() - 24*60*60*1000*num;
  return new Date(date).toDateString() === new Date(time).toDateString()
}
/**判断是否是今天 */
DateUtil.prototype.isToday = function(date) {
  date = DateUtil.prototype.newDateFormateIOS(date); //  date.replace(/-/g, "/");
  return new Date(date).toDateString() === new Date().toDateString()
}
/* 获取日期选择器的当前时间和开始时间,结束时间 年月日 */
DateUtil.prototype.getDate = function (type,lastType = 'date') {
  const date = new Date();

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  if (type === "mociyuej") {
    return DateUtil.prototype.getPreMonthDay(year + '-' + month + '-' + day, 10);
  }
  month = month > 9 ? month : '0' + month;;
  day = day > 9 ? day : '0' + day;
  hour = hour > 9 ? hour : '0' + hour;
  minutes = minutes > 9 ? minutes : '0' + minutes;
  seconds = seconds > 9 ? seconds : '0' + seconds;
  // if (type === "now") {
  //   if (lastType && lastType == 'seconds') {
  //     return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
  //   } else {
  //     return `${year}-${month}-${day}`;
  //   }
  // }
  if (type === 'start') {
    year = year - 60;
  } else if (type === 'end') {
    year = year + 2;
  } else if (type === 'now') {
    year = year;
  }
  if (lastType && lastType == 'seconds') {
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
  } else if (lastType && lastType == 'minutes') {
    return `${year}-${month}-${day} ${hour}:${minutes}`;
  } else if (lastType && lastType == 'hour') {
    return `${year}-${month}-${day} ${hour}`;
  } else {
    return `${year}-${month}-${day}`;
  }
  // return `${year}-${month}-${day}`;
}
//获取当前日期的前n个月份的日期 往前数monthNum月份，不能往后数monthNum
DateUtil.prototype.getPreMonthDay= function(date, monthNum) {
  let dateArr = date.split('-')
  let year = dateArr[0] //获取当前日期的年份
  let month = dateArr[1] //获取当前日期的月份
  let day = dateArr[2] //获取当前日期的日
  let days = new Date(year, month, 0)
  days = days.getDate() //获取当前日期中月的天数
  let year2 = year
  let month2 = parseInt(month) - monthNum
  if (month2 <= 0) {
    year2 =
      parseInt(year2) -
      parseInt(month2 / 12 == 0 ? 1 : Math.abs(parseInt(month2 / 12)) + 1)
    month2 = 12 - (Math.abs(month2) % 12)
  }
  let day2 = day
  let days2 = new Date(year2, month2, 0)
  days2 = days2.getDate()
  if (day2 > days2) {
    day2 = days2
  }
  if (month2 < 10) {
    month2 = '0' + month2
  }
  let t2 = year2 + '-' + month2 + '-' + day2
  return t2
}

module.exports = new DateUtil();