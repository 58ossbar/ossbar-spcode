// pages/other/stuptqd/stuptqd.js
const core = require("../../../utils/core/core.js")
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min');// 引入SDK核心类

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataForm:{
      area:'',//具体位置 省市区 
      areaTitle:'',//名称 地理位置
      time:'',//当前时间
      img:'',
      activityId:"",
    },//表单数据
    isGetingLocation:true,//是否获取了地理位置
    currTime:'',//当前时间
    setInterval:'',//刷新当前时间定时器
    isSign:false,//是否签到
    ctId:'',//课堂id
  },
  /**预览图片 */
  toPreviewImg(){
    let arr = []// 需要预览的图片http链接列表
    arr.push(this.data.dataForm.img)
    core.service.previewImage(arr, function () { })
  },
  /**去签到 */
  toSign:function(){
    if(!this.data.dataForm.areaTitle){
      core.dialogUtil.showToast({title:'获取位置失败'})
      return false;
    }
    let that = this;
    core.chooseImage({
      count:1,
      sourceType :['camera'],
      success(res){
        let formData = {
          ctId:that.data.ctId,
          activityId:that.data.dataForm.activityId,
          signType:'1',
          area:that.data.dataForm.area,
          areaTitle:that.data.dataForm.areaTitle
        }
        core.uploadFile({
          url:'wx/activity-api/signin/signIn',
          filePath: res.tempFilePaths[0],
          formData:formData,
          success: function (res2) {
            let res2data = typeof (res2.data) == 'string' ? JSON.parse(res2.data) :(res2.data)
            if (res2data.code === 0) {
              that.setData({
                ['dataForm.img']: res.tempFilePaths[0]
              })
              if(res2data.msg){
                core.dialogUtil.showToast({title:res2data.msg})
              }
              core.service.backPageOnload();
              

            }
          }
        })
      }
    })
  },
  /**查看 签到活动 信息 */
  viewSigninInfo:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      activityId: this.data.dataForm.activityId
    };
    if(!data.activityId){
      return false;
    }
    core.request({
      url: "wx/activity-api/signin/viewTraineeSignInfo",
      method: "GET",
      data:data,
      success: function(res) {
        if(res.data.code == 0){
          if(core.stringUtil.objectIsNotNull(res.data.data)){
            
            that.data.dataForm.areaTitle = res.data.data.areaTitle;
            that.data.dataForm.area = res.data.data.area;
            that.data.dataForm.time = res.data.data.signTime;
            that.data.dataForm.img = core.concatImgUrl(res.data.data.file);
            that.setData({
              dataForm:that.data.dataForm
            })

          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    this.data.ctId = ( options && options.ctId)?(options.ctId): ( (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'' ) ;
    this.data.dataForm.activityId = (options && options.activityId)?(options.activityId):'';
    let currEditActivity = ( options && options.currEditActivity && core.stringUtil.objectIsNotNull( JSON.parse(options.currEditActivity)  ))?(JSON.parse(options.currEditActivity)): ( (core.globalData.paramsData.currEditActivity && core.stringUtil.objectIsNotNull(core.globalData.paramsData.currEditActivity) ) ? (core.globalData.paramsData.currEditActivity):{} );
    this.data.isSign = false;
    if(core.stringUtil.objectIsNotNull(currEditActivity) && (currEditActivity.isSigned)){
      this.data.isSign = true;
      this.viewSigninInfo();
    }else{
      this.getLocation();
    }

    let that = this;
    this.getRealTime();
    this.data.setInterval = setInterval(function(){
      that.getRealTime();
      if(that.data.isSign){
        that.clearTimeInterval();
      }
    },30000);
    this.setData({
      ctId:this.data.ctId,
      ['dataForm.activityId']:this.data.dataForm.activityId,
      isSign:this.data.isSign,
      setInterval:this.data.setInterval
    })
  },
  /**授权 获取 地理位置  */
  getLocation:function() {
    this.data.isGetingLocation = true;
    this.setData({
      isGetingLocation:this.data.isGetingLocation
    })
    let that = this;
    /**授权 */
    wx.authorize({
      scope: 'scope.userLocation',
      success (res) {
        if(res.errMsg == "authorize:ok" ){
          wx.showLoading({
            title: '定位中……',
            mask:true
          })
          wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            altitude:true,
            success (res1) {
              // 将地理坐标精确到小数点后七位
              // let latitude = Number(options.latitude).toFixed(7);
              // let longitude = Number(options.longitude).toFixed(7);
              //调用腾讯地图SDK 将坐标 解析为地理位置
              let qqMapWX = new QQMapWX({
                key:'IMBBZ-MFUH3-DQP3Y-YQ6YR-TJHDH-PVBHR'
              });
              qqMapWX.reverseGeocoder({
                location: res1.latitude+','+res1.longitude,
                success: function(res2) {
                  wx.hideLoading();
                  if(res2.status == 0){
                    that.data.dataForm.areaTitle = res2.result.formatted_addresses.recommend;
                    that.data.dataForm.area =  res2.result.address
                    that.setData({
                      ['dataForm.area']:that.data.dataForm.area,
                      ['dataForm.areaTitle']:that.data.dataForm.areaTitle
                    })
                  }else{
                    that.data.isGetingLocation = false;
                    that.setData({
                      isGetingLocation:that.data.isGetingLocation
                    })
                    core.dialogUtil.showToast({title:res2.message});
                  }
                },
                fail: function(error) {
                  wx.hideLoading();
                  that.data.isGetingLocation = false;
                    that.setData({
                      isGetingLocation:that.data.isGetingLocation
                    })
                  if(error && error.message){
                    core.dialogUtil.showToast({title:'解析地址失败：'+error.message});
                  }
                }
              })
            },
            fail:function(err){
              wx.hideLoading();
              if(err && err.errMsg){
                if(core.stringUtil.contains(err.errMsg,'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF')){//授权失败
                  core.dialogUtil.showToast({title:'获取定位失败，WiFi或者定位的开关没有打开，无法获取定位'})
                  // that.authorizeRecorder();
                }
              }
              that.data.isGetingLocation = false;
              that.setData({
                isGetingLocation:that.data.isGetingLocation
              })
            }
           })
        }else{
          that.data.isGetingLocation = false;
          that.setData({
            isGetingLocation:that.data.isGetingLocation
          })
          // that.getLocation();
        }
      },
      fail:function(err1){
        that.data.isGetingLocation = false;
        that.setData({
          isGetingLocation:that.data.isGetingLocation
        })
        if(core.stringUtil.contains(err1.errMsg,'auth deny')){//授权失败
          core.dialogUtil.showToast({title:'您已经拒绝授权，无法获取定位，如需使用，请删除此小程序，并重新搜索打开'})
          // that.authorizeRecorder();
        }
      }
    })
  },
  /**清除 时间 的定时器  */
  clearTimeInterval:function() {
    clearInterval(this.data.setInterval);
    this.data.setInterval = null;
    this.setData({
      setInterval:this.data.setInterval
    })
  },
  /**实时获取当前时间 09:26 */
  getRealTime:function(){
    let hour = new Date().getHours() ;
    if(parseInt(hour)<10){
      hour =  '0'+hour
    }
    let minute = new Date().getMinutes() ;
    if(parseInt(minute)<10){
      minute =  '0'+minute
    }
    this.data.currTime = hour + ':'+ minute ;
    this.setData({
      currTime:this.data.currTime
    })
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
    this.clearTimeInterval();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearTimeInterval();
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