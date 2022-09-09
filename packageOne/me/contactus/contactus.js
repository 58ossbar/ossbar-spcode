// packageOne/me/contactus/contactus.js
const app = getApp();
const core = require("../../../utils/core/core.js")
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min');// 引入SDK核心类
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyInfo:{
      mobile:'0731-89913439',
      location:'湖南省长沙市望城区新塘路199号', // 湖南创蓝信息科技有限公司
      latitude: 28.344078,//	纬度
      longitude: 112.822706,//	经度   lng: 112.828743  lat: 28.34407
      scale:20, // 缩放级别，取值范围为3-20
      markers:[
        {
          id:1,
          latitude: 28.344078,//	纬度
          longitude: 112.822706,//	经度
          width: 50,
          height: 50,
          title:'湖南创蓝信息科技有限公司',
          callout:{
            content:'湖南省长沙市望城区新塘路199号\n湖南创蓝信息科技有限公司',
            padding:10,
            borderRadius:5,
            textAlign:'center'
          },
          iconPath:'../../../images/platfromLog.png'
        }
      ], // 标记点
      circles: [
        {
          latitude: 28.344078,//	纬度
          longitude: 112.822706,//	经度
          color: '#FF0000DD',
          fillColor: '#7cb5ec88',
          radius: 5,
          strokeWidth: 1
        }
      ]
    },//公司信息
  },
  getLatitudeAndLongitude:function () {
    let that = this;
    //调用腾讯地图SDK 将坐标 解析为地理位置
    let qqMapWX = new QQMapWX({
      key:'IMBBZ-MFUH3-DQP3Y-YQ6YR-TJHDH-PVBHR'
    });
    qqMapWX.geocoder({
      address: that.data.companyInfo.location,
      success: function(res2) {
        // console.log('res2', res2)
        
        if(res2.status == 0){
          that.data.companyInfo.latitude = res2.result.location.lat;
          that.data.companyInfo.longitude = res2.result.location.lng;
          that.setData({
            ['companyInfo.latitude']: that.data.companyInfo.latitude,
            ['companyInfo.longitude']: that.data.companyInfo.longitude
          });
        }else{
          
          core.dialogUtil.showToast({title:res2.message});
        }
      },
      fail: function(error) {
        if(error && error.message){
          core.dialogUtil.showToast({title:'解析地址失败：'+error.message});
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getLatitudeAndLongitude();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createMapContext 获取 map 上下文
    // this.mapCtx = wx.createMapContext('myMap')
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