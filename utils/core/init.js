const core = require("core.js")

function init(){
  //展示本地存储能力
  let logs = wx.getStorageSync('logs') || []
  logs.unshift(Date.now()) // util.formatTime(new Date(log))
    wx.setStorageSync('logs', logs)
  // 获取系统信息
  core.service.getSystemInfoToHandleGlobalData();
  //网络状态
  wx.getNetworkType({
    success: function (res) {
      if (core.stringUtil.contains(res.errMsg, "ok")) {
        core.globalData.sysInfo.netWorkInfo.networkType = res.networkType;
        core.globalData.sysInfo.netWorkInfo.state = (res.networkType != "none");
      }
    }
  });
  //网络状态改变
  wx.onNetworkStatusChange(function (res) {
    core.globalData.sysInfo.netWorkInfo.networkType = res.networkType;
    core.globalData.sysInfo.netWorkInfo.state = res.isConnected;
  });
  //监听小程序切前台事件
  wx.onAppShow(function(show){
  });
  //监听小程序切后台事件
  wx.onAppHide(function(hide){
  });

  let userInfo = core.paramUtil.getData("userInfo");
  if(userInfo) {
    core.globalData.userInfo = userInfo;
  }
  
}

module.exports = init();