/**
 * 字符串工具
 */
function StringUtil() { }
const globalData = require("globaldata.js")

/** 根据 classroomIdentity,isAssistant,permsList,permsName 来判断是否有权限  */
StringUtil.prototype.judgeIsPerms = function (classroomIdentity,isAssistant,permsList,permsName) {
  let result = false;
   if (classroomIdentity && classroomIdentity == 'teacher') {
    result = true;
  } else if (classroomIdentity && classroomIdentity == 'student') {
    result = false;
  }else if (classroomIdentity && classroomIdentity == 'assistant') {  // 是助教
    result = false;
    if (permsList && permsList.length > 0 && permsList.indexOf(permsName) > -1) {
      result = true;
    }
  }
  return result;
  
}

/**对版本进行 比较，判断是否是新版本 */
StringUtil.prototype.compareVersion = function (v1, v2) { //2.9.1   2.9.0
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {//在后面补0
    v1.push('0')
  }
  while (v2.length < len) {//在后面补0
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

/**
 * 判断object对象{}是否不为空
 */
StringUtil.prototype.objectIsNotNull = function (object) {
  if (object && JSON.stringify(object) != '{}'){
    return true;
  }else{
    return false;
  }
}

/**
 * 判断是否包含指定字符串
 */
StringUtil.prototype.contains = function (str, sub) {
  return ( (str) && (str.indexOf(sub) >= 0) ) ? true : false;
}

/**
 * 判断两个字符串是否相等，相等返回true,否则返回false
 */
StringUtil.prototype.eq = function (str1, str2) {
  return str1 == str2;
}
/**
 * 判断两个字符串是否不相等，不相等返回true，否则返回false
 */
StringUtil.prototype.nq = function (str1, str2) {
  return str1 != str2;
}
/**
 * 判断是否以指定字符串开头
 */
StringUtil.prototype.startWith = function (str1, sub){
  return (str1 && str1.indexOf(sub) == 0)? true:false;
}
/**
 * 判断是否以指定字符串结束
 */
StringUtil.prototype.endWith = function(str,sub){
  // let reg = new RegExp(sub + "$",g);
  // reg.test(str);
  return (str.slice(-sub.length) === sub);
}
/**
 * 给指定字符串前、后补零
 * len:补零后的长度
 * pos :补零的位置，0为前，1为后
 */
StringUtil.prototype.addZero = function(str,len = 0,pos = 0){
  str += "";
  while(str.length < len){
   if(pos == 0){
     str = "0" + str;
   }else{
     str += "0";
   }
  }
  return str;
}

//去两端空格
StringUtil.prototype.trim = function (str) {
  return (str && str.replace(/(^\s*)|(\s*$)/g, ""));
}
//去左边空格
StringUtil.prototype.lTrim = function (str) {
  return str.replace(/(^\s*)/g, "");
}
//去右边空格
StringUtil.prototype.rTrim = function (str) {
  return str.replace(/(\s*$)/g, "");
}

//把数据转换成中文数字
const chinese_numerals = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
StringUtil.prototype.convertToChinese = function (num) {
  var numeral = "";
  //十位
  if (num > 9) {
    var shi = parseInt(num / 10);
    if (shi == 1) shi = 0;
    numeral += chinese_numerals[shi] + "十";
  }
  //个位
  var ge = parseInt(num % 10);
  numeral += chinese_numerals[ge];
  return numeral;
}

module.exports = new StringUtil();