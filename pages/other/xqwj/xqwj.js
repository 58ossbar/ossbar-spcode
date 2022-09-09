// pages/other/xqwj/xqwj.js
const app = getApp();
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ctId:'',//课堂id
    activityInfo:{},//活动信息
    currTmIndex:0,//当前是第几道题目
    classType:'',//1加入的课堂（我听的课）2自己创建的课堂（我教的课）
    classroomIdentity:'', // 课堂里面的身份信息
  },
  /** 去展开收缩  学员在 选项时的 回答 */
  toFolder: function (event) {
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.activityInfo.questionList[0].children[currIndex].isFolder = !(this.data.activityInfo.questionList[0].children[currIndex].isFolder);
    this.setData({
      ['activityInfo.questionList[0].children['+currIndex+'].isFolder']:  this.data.activityInfo.questionList[0].children[currIndex].isFolder
    });
  },
  //跳转调查问卷（进行中）
  toStuxqWj: function (event) {
    core.globalData.paramsData.currEditActivity.hasBeenDone = true;
    let currIndex = event.currentTarget.dataset.currindex;
    let currObj  = this.data.activityInfo.questionList[0].traineeAnswerList[currIndex];
    wx.navigateTo({
      url: '/pages/other/stuxqwj/stuxqwj?traineeId='+ currObj.traineeId
    })
  },
  /**切换题目 */
  toTabTm:function(event){
    this.data.currTmIndex = event.currentTarget.dataset.currindex;
    this.setData({
      currTmIndex:this.data.currTmIndex
    })
    this.viewTraineeAnswerListData({pageNum:(this.data.currTmIndex+1)},true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.classType = (core.globalData.paramsData.classType) ? (core.globalData.paramsData.classType):'';

    this.data.classroomIdentity = (core.globalData.paramsData.classroomIdentity) ? (core.globalData.paramsData.classroomIdentity):'';
    

    this.setData({
      ctId:this.data.ctId,
      classType:this.data.classType,
      classroomIdentity:this.data.classroomIdentity
    })
    this.viewTraineeAnswerListData({pageNum:1},false);
  },
  /**获取活动详情 */
  viewTraineeAnswerListData:function(params,isLazy){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      activityId:core.globalData.paramsData.currEditActivity.activityId,
      pageNum:(params && params.pageNum)?(params.pageNum):1,
      pageSize:1,
    };
    if(!isLazy){
      data.pageNum = 1;
    }
    core.request({
      url: "wx/activity-api/voteQuestionnaire/viewTraineeAnswerListData",
      method: "GET",
      data:data,
      success: function(res) {
        if(res.data.code == 0){
          if(!isLazy){
            that.data.activityInfo = {}
            if(core.stringUtil.objectIsNotNull(res.data.activityInfo)){
              that.data.activityInfo = res.data.activityInfo;
            }
            that.data.activityInfo.questionList = [];
            that.data.activityInfo.tmList = [];
            if(res.data.data && res.data.data.totalCount){
              let totalCount = res.data.data.totalCount;
              for(let i=0;i<=(totalCount-1);i++){
                that.data.activityInfo.tmList.push(i);
              }
            }
          }
          if(core.stringUtil.objectIsNotNull(res.data.data)){
            if(res.data.data.list && res.data.data.list.length>0){
              let questionList = res.data.data.list;
              for(let a=0;a<questionList.length;a++){
                if(questionList[a].children && questionList[a].children.length>0){
                  questionList[a].children.forEach((itema,indexa) => {
                    itema.isFolder = false;
                    if(itema.answerInfos && itema.answerInfos.length>0){
                      itema.answerInfos.forEach((itemi,indexi) => {
                        itemi.traineePic = core.concatImgUrl(itemi.traineePic);
                      });
                    }
                  });
                }
                

                if(questionList[a].questionType == '3' && questionList[a].traineeAnswerList && questionList[a].traineeAnswerList.length>0){
                  let traineeAnswerList = questionList[a].traineeAnswerList;
                  for(let a2=0;a2<traineeAnswerList.length;a2++){
                    traineeAnswerList[a2].traineePic = core.concatImgUrl(traineeAnswerList[a2].traineePic);
                  }
                }
              }
              that.data.activityInfo.questionList = questionList ;
            }
          }
          that.setData({
            activityInfo:that.data.activityInfo
          })
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
    core.globalData.paramsData.currEditActivity.hasBeenDone = false;
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