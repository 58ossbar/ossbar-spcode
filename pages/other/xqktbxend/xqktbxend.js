// pages/other/xqktbxend/xqktbxend.js
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberList:[],//成员数组
    ctId:'',//课堂id
    currEditActivity:{},//上一个页面传递的当前活动的信息
  },
  /** 获取所有学员列表 数据 */
  getMemberList:function(){
    let that = this;
    let data = {
      ctId: that.data.ctId,
      activityId: that.data.currEditActivity.activityId,
    };
    core.request({
      url: "wx/activity-api/performance/answerSummaryResults",
      method: "POST",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if(res.data.data && res.data.data.length>0){
            that.data.memberList = res.data.data;
            that.data.memberList.forEach((item,index)=>{
              item.isChecked = false;
              item.traineePic = core.concatImgUrl(item.traineePic);
            });
            that.setData({
              memberList:that.data.memberList
            });
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.currEditActivity = ( options && options.currEditActivity && core.stringUtil.objectIsNotNull(JSON.parse(options.currEditActivity)))?(JSON.parse(options.currEditActivity)): ( (core.globalData.paramsData.currEditActivity && core.stringUtil.objectIsNotNull(core.globalData.paramsData.currEditActivity) ) ? (core.globalData.paramsData.currEditActivity):{} );

    this.setData({
      ctId: this.data.ctId,
      currEditActivity: this.data.currEditActivity
    });
    this.getMemberList();
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