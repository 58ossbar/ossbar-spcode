// packageOne/create/createssqd/createssqd.js
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
      remark:"",//备注
      empiricalValue:"",//经验值(签到可获得的经验值)
      number:"" //手势签到的数字顺序
    },//表单数据
    pkgId:'',//教学包id
    isShowDetail:false,//是否是详情页
    isUseNewCanvas: (core.stringUtil.compareVersion(wx.getSystemInfoSync().SDKVersion, '2.9.0') >= 0),//是否采用canvas 2d
    modalIsShow:false,//弹窗是否显示
    canvasTempFilePath:'',//canvas 转换成的图片
  },
  /**保存 */
  toSave:function(){
    let that = this;
    let data = {
      pkgId:this.data.pkgId
    };
    data = Object.assign(data,this.data.dataForm);
    //对提交的数据进行验证
    if(!(core.stringUtil.trim(data.number)) ){
      core.dialogUtil.showToast({title:'手势不能为空，请设置手势'})
      return false;
    }
    core.dialogUtil.showModal({content:'确定提交吗？'},function() {
      core.request({
        url: "wx/activity-api/signin/saveSigninInfo?token="+core.globalData.userInfo.token+'&pkgId='+that.data.pkgId,
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            core.globalData.paramsData.activityIndex = 1;
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            core.service.backPageOnload();
          }
        }
      });
    },function() {});
  },
  /**重新设置 */
  toReset:function(){
    this.gesturePattern.reset();
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
    //获取pkgId的值
    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';
    this.data.isShowDetail = (options && options.type && options.type == 'showdetail')?true:false;
    this.data.dataForm.activityId = (options && options.activityId)?(options.activityId):'';
    this.setData({
      pkgId:this.data.pkgId,
      isShowDetail:this.data.isShowDetail,
      ['dataForm.activityId']:this.data.dataForm.activityId
    })
    let title = '创建手势签到';
    if(this.data.isShowDetail){
      title = '查看手势签到';
    }else if(this.data.dataForm.activityId){
      title = '编辑手势签到';
    }
    wx.setNavigationBarTitle({//动态设置当前页面的标题
      title: title
    })

    if(!this.data.dataForm.activityId){
      this.initGesturePattern();
    }else{
      this.viewSigninInfo();
    }
    
  },
  /**初始化 图案 */
  initGesturePattern: function(){
    let that = this;
    this.gesturePattern = new GesturePattern(this,{
      canvasId:'canvasId',
      isUseNewCanvas:( (that.data.isUseNewCanvas)?'true':'false' ),
      canvasType:(that.data.dataForm.number)?'showPwd':'',
      canvasOldPwd: (that.data.dataForm.number)?(that.data.dataForm.number):'',
      onSuccess:(res)=>{
        that.data.dataForm.number = res.canvasPwd;
        that.setData({
          ['dataForm.number']:that.data.dataForm.number
        })
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