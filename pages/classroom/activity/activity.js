// pages/other/activity/activity.js
const app = getApp();
const core = require("../../../utils/core/core.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.activityComm =  this.selectComponent('#activityComm');
  },
  /**处理 清空 全局变量 */
  handGlobalData:function(){
    core.globalData.paramsData.currEditActivity = {};//当前选择的活动
    core.globalData.questionnaireData.firstData = {};//活动-投票/问卷-第一页基本数据
    core.globalData.questionnaireData.secondData = {};//活动-投票/问卷-第二页题目数据
    core.globalData.noticeData = {};//活动-通知数据
    core.globalData.classroomPerformanceData = {}; // 活动-课堂表现数据
    core.globalData.paramsData.messagingType = '';//消息的类型
    core.globalData.paramsData.onlyWatchActivityInfo = ''; // 是否查看 创建活动的活动详情
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.handGlobalData();
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

  },

})