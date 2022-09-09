// pages/other/stussqd/stussqd.js
const GesturePattern = require("../../../utils/core/GesturePattern.js")
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataForm:{
      activityId:"",
      activityTitle:"",
      limitTime:"",//时间范围(单位分钟)
      signType:"2",//签到类型(1普通签到2手势签到3手工登记)
      number:"" //手势签到的数字顺序
    },//表单数据
    ctId:'',//课堂id
    isSigned:false,//是否签到
    isUseNewCanvas: (core.stringUtil.compareVersion(wx.getSystemInfoSync().SDKVersion, '2.9.0') >= 0),//是否采用canvas 2d
    modalIsShow:false,//弹窗是否显示
    canvasTempFilePath:'',//canvas 转换成的图片
  },
  /**弹窗 公共组件 返回的 ，监听是否显示弹窗，解决canvas层级问题 */
  compModalIsShow:function(event){
    // let that = this;
     let modalIsShow = event.detail.data;
     this.data.modalIsShow = false;
     if(modalIsShow){
      this.data.modalIsShow = true;
      this.data.canvasTempFilePath = (this.gesturePattern && this.gesturePattern.canvasTempFilePath)?(this.gesturePattern.canvasTempFilePath):'';
     }else{
        this.data.canvasTempFilePath = ''
     }
     this.setData({
      modalIsShow:this.data.modalIsShow,
      canvasTempFilePath:this.data.canvasTempFilePath
    })
  },
  /**查看 签到活动 信息 */
  viewSigninInfo:function(){
    let that = this;
    let data = {
      activityId: this.data.dataForm.activityId
    };
    if(!data.activityId){
      return false;
    }
    core.request({
      url: "wx/activity-api/signin/viewSigninInfo",
      method: "GET",
      data:data,
      success: function(res) {
        if(res.data.code == 0){
          if(core.stringUtil.objectIsNotNull(res.data.data)){
            that.data.dataForm.activityId = res.data.data.activityId;
            that.data.dataForm.signType = '2';
            that.data.dataForm.number = res.data.data.number
            that.setData({
              dataForm:that.data.dataForm
            })
            
          }
          that.initGesturePattern();
        }
      },
      fail:function(){
        that.initGesturePattern();
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    this.data.ctId = ( options && options.ctId)?(options.ctId): ( (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'' ) ;
    let currEditActivity = ( options && options.currEditActivity && core.stringUtil.objectIsNotNull( JSON.parse(options.currEditActivity)  ))?(JSON.parse(options.currEditActivity)): ( (core.globalData.paramsData.currEditActivity && core.stringUtil.objectIsNotNull(core.globalData.paramsData.currEditActivity) ) ? (core.globalData.paramsData.currEditActivity):{} );
    
    this.data.dataForm.activityId = (options && options.activityId)?(options.activityId):'';
    this.data.isSigned = false;
    if(core.stringUtil.objectIsNotNull(currEditActivity) && (currEditActivity.isSigned)){
      this.data.isSigned = true;
    }

    this.setData({
      ctId:this.data.ctId,
      ['dataForm.activityId']:this.data.dataForm.activityId,
      isSigned:this.data.isSigned
    })
    this.viewSigninInfo();
  },
  /**初始化 图案 */
  initGesturePattern: function(){
    let that = this;
    this.gesturePattern = new GesturePattern(this,{
      canvasId:'canvasId',
      isUseNewCanvas:( (that.data.isUseNewCanvas)?'true':'false' ),
      canvasType:(that.data.dataForm.number)? (that.data.isSigned?'showPwd':'checkPwd'):'',
      canvasOldPwd: (that.data.dataForm.number)?(that.data.dataForm.number):'',
      onSuccess:(res)=>{
        if(res.eType == 'checkPwdSuc'){
          that.signIn();
        }
      }
    });
  },
  /**签到 成功 */
  signIn:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      activityId:this.data.dataForm.activityId,
      // file:null,
      signType:'2',
      number:this.data.dataForm.number,
    }
    core.request({
      url: "wx/activity-api/signin/signIno?token="+core.globalData.userInfo.token,
      method: "POST",
      header: {
        'content-type': 'application/json' //表单方式 默认值
      },
      data:data,
      success: function(res) {
        if(res.data.code == 0){
          if(res.data.msg){
            core.dialogUtil.showToast({title:res.data.msg})
          }
          core.service.backPageOnload();
        }
      }
    });
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