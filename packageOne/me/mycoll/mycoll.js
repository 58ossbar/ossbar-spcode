// packageOne/me/mycoll/mycoll.js
const core = require("../../../utils/core/core.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabList:[],//类型列表 数据
    currTab:0,//当前类型的下标
    requestPage: {
      pageNum: 1,//当前第几页
      pageSize: 10//每页多少条
    },//页面 数据
    collectList:[],//课堂列表数据
    noDatacolIsShow:false,//暂无数据是否显示
  },
  /**去课堂的详情页 活动 */
  toClassRoomDetail:function(event){
    let currIndex  = event.currentTarget.dataset.currindex;
    let that = this;
    core.request({
      url: 'wx/classroom-api/viewClassroomInfo',
      method: "GET",
      data:{
        ctId: that.data.collectList[currIndex].ctId
      },
      success: function (res) {
        if (res.data.code === 0) {

          if(that.data.collectList[currIndex].isCheck =='Y' && that.data.collectList[currIndex].isApply && !that.data.collectList[currIndex].isPass &&  !that.data.collectList[currIndex].isOwner){
            if ( that.data.collectList[currIndex].classroomState && that.data.collectList[currIndex].classroomState == '3' ) {
              core.dialogUtil.showToast({title:'该课堂已结束'});
              return false;
            }
            
            core.globalData.paramsData.courseListCurrJoiningRoom = that.data.collectList[currIndex];
            core.globalData.paramsData.isFromCourseList = 'true';
            wx.navigateTo({
              url: '/pages/course/codejoin/codejoin',
            })
            // core.dialogUtil.showToast({title:'此课堂老师还未通过你的审核，请耐心等待'});
            return false;
          }
          //hasJoined布尔值，是否加入课堂：true已加入false未加入
          let hasJoined =  (that.data.collectList[currIndex].isJoined) ?'Y':'N';
          let classType  =  (that.data.collectList[currIndex].isOwner)?'2':'1';
          if(hasJoined == 'N' && classType == '1'){
            if ( that.data.collectList[currIndex].classroomState && that.data.collectList[currIndex].classroomState == '3' ) {
              core.dialogUtil.showToast({title:'该课堂已结束'});
              return false;
            }

            // core.globalData.paramsData.courseListCurrJoiningRoom = this.data.collectList[currIndex];
            core.globalData.paramsData.isFromCourseList = 'true';
            // core.dialogUtil.showToast({title:'当前未加入该课堂，请先申请加入课堂',mask:'true'});
            // setTimeout(function(){
              wx.navigateTo({
                url: '/pages/course/codejoin/codejoin',
              })
            // },core.globalData.operState.duration)
            return false;
          }



          core.globalData.paramsData.pkgId = that.data.collectList[currIndex].pkgId;
          core.globalData.paramsData.ctId =  that.data.collectList[currIndex].ctId;
          core.globalData.paramsData.subjectId = that.data.collectList[currIndex].subjectId;
          core.globalData.paramsData.classId =  that.data.collectList[currIndex].classId;
          core.globalData.paramsData.classType  =  (that.data.collectList[currIndex].isOwner)?'2':'1';
          core.globalData.paramsData.classroomState =  that.data.collectList[currIndex].classroomState;
          
          core.globalData.paramsData.activityIndex = 1;//活动状态
          if(core.globalData.paramsData.classType == '2'){
            core.globalData.paramsData.classroomIdentity = 'teacher';
          } else {
            core.globalData.paramsData.classroomIdentity = 'student';
          }
      
          if (that.data.collectList[currIndex].teachingAssistantId && that.data.collectList[currIndex].teachingAssistantId == core.globalData.myInfo.basicInfo.traineeId) { // 是助教
            
            core.globalData.paramsData.classroomIdentity = 'assistant';
            core.globalData.paramsData.classType = '2';
            core.globalData.paramsData.isAssistant = '1'; // 1是助教 
      
            core.globalData.paramsData.permsList = [];
            wx.navigateTo({
              url: '/pages/classroom/resource/resource',
            })
          } else {
            wx.navigateTo({
              url: '/pages/classroom/resource/resource',
            })
          }
          
        }else {
          if(res.data.msg){
            core.dialogUtil.showToast({title:res.data.msg})
          }
          if(res.data.code === 500){
            setTimeout(function(){
              that.findCollectList(that.data.requestPage,false);
            },core.globalData.operState.duration)
          }
        }
      }
    });

    
  },
  /**课堂  收藏或者取消收藏 */
  toOperationColl:function(event){
    let that = this;
    let type = event.currentTarget.dataset.type;
    let data = {};
    let url = '';
    let method = 'GET';
    if (type && type == 'blog') {
      let postId = event.currentTarget.dataset.postid;
      data = {
        postId: postId,
      };
      method = 'POST';
      url = 'wx/blog-api/collect';
    } else {
      let ctId = event.currentTarget.dataset.ctid;
      data = {
        ctId: ctId,
      };
      url = 'wx/classroom-api/cancelCollect';
    }
    
    
    
    core.request({
      url: url,
      method: method,
      data:data,
      success: function (res) {
        if (res.data.code === 0) {
          if(res.data.msg){
            core.dialogUtil.showToast({title:res.data.msg})
          }
          that.findCollectList(that.data.requestPage,false);
        }
      }
    });
  },
  /** 获取 类型列表 数据*/
  findTabList:function(){
    let that = this;
    core.request({
      url: "wx/collect-api/listfavorityType",
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.data.tabList = [];
          if(res.data.data && res.data.data.length>0){
            that.data.tabList = res.data.data;
          }
          that.setData({
            tabList:that.data.tabList
          })
          that.findCollectList(that.data.requestPage,false);
        }
      }
    });
  },
  /**获取列表数据 */
  findCollectList:function(requestPage,isLazy){
    let that = this;
    that.data.noDatacolIsShow = false;
    that.setData({
      noDatacolIsShow:that.data.noDatacolIsShow
    });
    let data = {
      pageNum: requestPage.pageNum,
      pageSize: requestPage.pageSize,
      favorityType: that.data.tabList[that.data.currTab].dictCode,
    };
    if (!isLazy) {
      that.data.collectList = [];
      that.setData({
        collectList:that.data.collectList
      });
      data.pageNum = 1;

    }
    core.request({
      url: "wx/collect-api/query",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if (!isLazy) {
            that.data.collectList = []
          }
          let ss = []
          if(res.data.data && res.data.data.list && res.data.data.list.length>0){
            ss = res.data.data.list
            for (let i = 0; i < ss.length; i++) {
              ss[i].pic = core.concatImgUrl(ss[i].pic);
              that.data.collectList.push(ss[i]);
            }
          }
          that.setData({
            collectList: that.data.collectList
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
        if(!that.data.collectList || (that.data.collectList && that.data.collectList.length<1)){
          that.data.noDatacolIsShow = true;
          that.setData({
            noDatacolIsShow:that.data.noDatacolIsShow
          });
        }
      },
      fail:function(){
        if(!that.data.collectList || (that.data.collectList && that.data.collectList.length<1)){
          that.data.noDatacolIsShow = true;
          that.setData({
            noDatacolIsShow:that.data.noDatacolIsShow
          });
        }
      }
    });
  },
  /**去切换 */
  toTab:function(event) {
    this.data.currTab = event.currentTarget.dataset.currindex;
    this.setData({
      currTab:this.data.currTab
    })
    this.findCollectList(this.data.requestPage,false);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.findTabList();
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
    core.globalData.paramsData.pkgId = '';
    core.globalData.paramsData.ctId =  '';
    core.globalData.paramsData.subjectId = '';
    core.globalData.paramsData.classId =  '';
    core.globalData.paramsData.classType  = '';
    core.globalData.paramsData.classroomState = '';
    core.globalData.paramsData.postId = '';
    core.globalData.paramsData.replyPages = '';
    core.globalData.paramsData.replyTraineeInfo = '';
    core.globalData.paramsData.courseListCurrJoiningRoom = {};
    core.globalData.paramsData.isFromCourseList = '';
    core.globalData.paramsData.classroomIdentity = '';
    core.globalData.paramsData.isAssistant = '';
    core.globalData.paramsData.permsList = [];
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
      this.findCollectList(this.data.requestPage, true);
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