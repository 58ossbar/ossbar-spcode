// packageOne/me/updatelog/updatelog.js
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestPage: {
      pageNum: 1,//当前第几页
      pageSize: 8//每页多少条
    },//页面 数据
    logsList:[],//日志列表数据
    contentList:[],//富文本解析内容 列表
    noDataLogIsShow:false,//暂无数据是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.findLogsList(this.data.requestPage,false);
  },
  /**获取 日志列表数据 */
  findLogsList:function(requestPage,isLazy){
    let that = this;
    that.data.noDataLogIsShow = false;
    that.setData({
      noDataLogIsShow:that.data.noDataLogIsShow
    });
    let data = {
      pageNum: requestPage.pageNum,
      pageSize: requestPage.pageSize,
    };
    if (!isLazy) {
      data.pageNum = 1
    }
    core.request({
      url: "wx/updatelog-api/query",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if (!isLazy) {
            that.data.logsList = []
          }
          let ss = []
          if(res.data.data && res.data.data.list && res.data.data.list.length>0){
            ss = res.data.data.list;
            for (let i = 0; i < ss.length; i++) {
              that.data.logsList.push(ss[i]);
            }
          }
          that.setData({
            logsList: that.data.logsList
          })
          if(res.data.data && res.data.data.currPage){
            that.data.requestPage.pageNum = res.data.data.currPage
            that.setData({
              ['requestPage.pageNum']: that.data.requestPage.pageNum
            })
          }
          if(res.data.data && res.data.data.totalPage){
            that.data.requestPage.pages = res.data.data.totalPage
            that.setData({
              ['requestPage.pages']:that.data.requestPage.pages
            })
          }
        }
        if(!that.data.logsList || (that.data.logsList && that.data.logsList.length<1)){
          that.data.noDataLogIsShow = true;
          that.setData({
            noDataLogIsShow:that.data.noDataLogIsShow
          });
        }
      },
      fail:function(){
        if(!that.data.logsList || (that.data.logsList && that.data.logsList.length<1)){
          that.data.noDataLogIsShow = true;
          that.setData({
            noDataLogIsShow:that.data.noDataLogIsShow
          });
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
    let pageNum = parseInt(this.data.requestPage.pageNum) + 1;
    if (pageNum <= parseInt(this.data.requestPage.pages)) {
      this.data.requestPage.pageNum = pageNum;
      this.findLogsList(this.data.requestPage,true);
      this.setData({
        ['requestPage.pageNum']: this.data.requestPage.pageNum
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})