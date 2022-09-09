let app = getApp();
const stringUtil = require("stringutil.js");//字符串工具
const globalData = require("globaldata.js");//字符串工具
const enumUtil = require("enumutil.js");//枚举
const dateUtil = require("dateutil.js");//日期处理
const validateUtil = require("validateutil.js");//验证
const dialogUtil = require("dialogutil.js");//对话框
const service = require("service.js");//对话框

app.onError = function (error) { //启动全局异常监听
  const logger = wx.getLogManager({ level: 0 });
  logger.log(error);
  log(error);
}
/**
 * 日志输出
 */
const log = function(msg){
  /**
   * 只有在开发和测试状态下才打印日志
   */
  if (app.globalData.appState != enumUtil.appState.PROD)
      console.log(msg);
}

module.exports = {
  //formatTime: formatTime
  stringUtil : stringUtil,
  request: service.request,
  log : log,
  service : service,
  paramUtil: service.paramUtil,
  enumUtil: enumUtil,
  dateUtil : dateUtil,
  validateUtil : validateUtil,
  dialogUtil: dialogUtil,
  globalData: globalData,
  getUserInfo: service.getUserInfo,
  concatImgUrl: service.concatImgUrl,
  uploadFile: service.uploadFile,
  chooseImage: service.chooseImage
}