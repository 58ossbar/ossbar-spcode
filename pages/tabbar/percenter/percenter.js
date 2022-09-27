// pages/tabbar/percenter/percenter.js
const app = getApp();
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalIsShow:false,//弹窗是否显示
    userState:'1',// 是否注册了手机0注册1未注册
    myInfo:{},//个人信息
    isTeacher:false,//是否是老师
  },
  // 去 我要咨询
  toZiXun: function () {
    core.service.openCustomerServiceChatComm();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**授权获取手机号码 */
  getPhoneNumberBack:function(event){
    if(event.detail.type == 'success'){
      core.globalData.userInfo.state = '0';
      this.data.userState = '0';
      this.setData({
        userState:this.data.userState
      })
      this.onShow();
    }
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    core.globalData.paramsData.replyTraineeInfo = '';
    core.globalData.paramsData.postId = '';
    core.globalData.paramsData.replyPages = '';
    core.globalData.paramsData.classType = '';
    core.globalData.paramsData.qrCodeOptionsData = {};
    //是否注册了手机号码，实时更新
    this.data.userState = (core.globalData.userInfo.state || core.globalData.userInfo.state=='0')?(core.globalData.userInfo.state):'1';
    this.setData({
      userState:this.data.userState
    })
    let that = this;
    //获取个人信息
    core.service.findUserInfoFromMysal(null,function(suc){
      if( suc.data){
        core.globalData.myInfo = suc.data;
        that.data.isTeacher =   (suc.isTeacher)?true:false;
        that.data.myInfo = suc.data;
        that.data.myInfo.basicInfo.traineePic = core.concatImgUrl(that.data.myInfo.basicInfo.traineePic);
        that.setData({
          myInfo:that.data.myInfo,
          isTeacher:that.data.isTeacher
        });
      }
      
    });
 
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 去到登录界面
   */
  toSignIn: function() {
    this.data.modalIsShow = true;
    this.setData({
      modalIsShow:this.data.modalIsShow
    });
  },
  /**
   * 我的收藏
   */
  toMyColl: function(event) {
    return false
    if(!core.service.isCanInto()){
      let that = this;
      setTimeout(function(){
        that.setData({
          modalIsShow:true
        })
      },core.globalData.operState.duration)
      return false;
    }
    wx.navigateTo({
      url: '/packageOne/me/mycoll/mycoll',
    })
  },
  // 去报名
  toBaoMing: function(event) {
    return false
    if(!core.service.isCanInto()){
      let that = this;
      setTimeout(function(){
        that.setData({
          modalIsShow:true
        })
      },core.globalData.operState.duration)
      return false;
    }
    wx.navigateTo({
      url: '/packageOne/me/traineesignup/traineesignup',
    })
  },
  /** 联系我们  */
  toContactUs: function(e) {
    wx.navigateTo({
      url: '/packageOne/me/contactus/contactus',
    })
  },

  /**
   * 更新日志
   */
  toUpdateLog: function(e) {
    if(!core.service.isCanInto()){
      let that = this;
      setTimeout(function(){
        that.setData({
          modalIsShow:true
        })
      },core.globalData.operState.duration)
      return false;
    }
    wx.navigateTo({
      url: '/packageOne/me/updatelog/updatelog',
    })
  }
})