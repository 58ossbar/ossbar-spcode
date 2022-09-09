function ValidateUtil(){}
const dialogUtil = require("dialogutil.js");

//验证是否是网址
ValidateUtil.prototype.checkNetworkAddress = function (fieldName, content,isRequired) {
  var strRegex = "^((https|http|ftp|frp|rtsp|mms)?://)"
  + "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@ 
//  + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@ 
  + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184 
  + "|" // 允许IP和DOMAIN（域名）
  + "([0-9a-z_!~*'()-]+\.)*" // 域名- www. 
  + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名 
  + "[a-z]{2,6})" // first level domain- .com or .museum 
  + "(:[0-9]{1,4})?" // 端口- :80 
  + "((/?)|" // a slash isn't required if there is no file name 
  + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"; 
  var re = new RegExp(strRegex); 

  if (!content || content.trim() == "") {
    if(isRequired){
      dialogUtil.showToast({ title: fieldName + '不能为空，请输入' + fieldName});
      return false;
    }
  }else if (!(re.test(content))) {
    dialogUtil.showToast({ title: fieldName + '格式不正确，请重新输入' });
    return false;
  }
  return true;
}

//验证电子邮箱
ValidateUtil.prototype.checkQq = function (fieldName, content,isRequired) {
  if (!content || content.trim() == "") {
    if(isRequired){
      dialogUtil.showToast({ title: fieldName + '不能为空，请输入' + fieldName});
      return false;
    }
  }else if (!(/^[1-9][0-9]{4,9}$/.test(content))) { //  /^\d{5,10}$/
    dialogUtil.showToast({ title: fieldName + '格式不正确，请重新输入' });
    return false;
  }
  return true;
}

//手机号
ValidateUtil.prototype.checkPhone= function (content) {
  if (!(/^1[3456789]\d{9}$/.test(content))) {
    dialogUtil.showToast({ title: "手机号码有误，请重填" })
    return false;
  }
  return true;
}

module.exports = new ValidateUtil();