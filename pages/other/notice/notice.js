// pages/other/notice/notice.js
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    dataForm:{
      title:'',//标题
      content:'',//通知内容
      traineeIds:[],//发送人id
      traineeNames:'',//发送人姓名
      ctId:'',//课堂id
    },//表单数据项
  },
  /**保存 */
  save:function(){
    let that = this;
    let data = Object.assign({},this.data.dataForm);

    if(!(core.stringUtil.trim(data.title)) ){
      core.dialogUtil.showToast({title:'标题不能为空，请输入标题'})
      return false;
    }
    if(!data.traineeIds || (data.traineeIds && data.traineeIds.length<1)){
      core.dialogUtil.showToast({title:'收件人不能为空，请选择收件人'})
      return false;
    }
    if(!(core.stringUtil.trim(data.content)) ){
      core.dialogUtil.showToast({title:'通知内容不能为空，请输入通知内容'})
      return false;
    }
    core.dialogUtil.showModal({content:'确定发送吗？'},function() {
      core.request({
        url: 'wx/sys-msg/sendText?token='+core.globalData.userInfo.token,
        method: "POST",
        data:data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg});
            }
            core.globalData.paramsData.activityIndex = 1;
            core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
          }
        }
      });
    },function() {});
    
  },
  /**input和textarea的实时输入事件 */
  bindinput:function(event){
    let name = event.currentTarget.dataset.name;
    this.data.dataForm[name] = event.detail.value;
    this.setData({
      ['dataForm.'+name]:this.data.dataForm[name]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.dataForm.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';
    this.setData({
      ['dataForm.ctId']:this.data.dataForm.ctId
    });
  },
  /**取消 */
  cancel:function(){
    wx.navigateBack();
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
    core.globalData.paramsData.memberListEventType = '';

    //跳转页面后返回获取dataForm的值后并清空
    if(core.stringUtil.objectIsNotNull(core.globalData.noticeData)){
      this.data.dataForm = Object.assign(this.data.dataForm,core.globalData.noticeData);
      this.setData({
        dataForm:this.data.dataForm
      })
      core.globalData.noticeData = {};
    }
  },
  //跳转成员列表
  toMemberList: function (e) {
    core.globalData.noticeData = Object.assign({},this.data.dataForm);
    core.globalData.paramsData.memberListEventType = 'toNotice';
    wx.navigateTo ({
      url: '/pages/other/memberlist/memberlist'
    })
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