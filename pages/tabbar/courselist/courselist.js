// pages/tabbar/courselist/courselist.js
const app = getApp()
const core = require("../../../utils/core/core.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    requestPage: {
      pageNum: 1,//当前第几页
      pageSize: 10//每页多少条
    },//页面 数据
    tabList:[],//tab列表
    classList:[],//课堂列表
    majorId:'',//当前tab的majorId
    manageSheetHidden: true,
    listName:'',//搜索名称
    isTop:'N',//是否置顶
    classType:'1',//是我教的课还是我听的课
    isQrCodeHide:true,//邀请码弹窗是否隐藏
    qrCode:'',//二维码
    classroomState:'-1',//课堂的状态
    noDataClaIsShow:false, //暂无数据是否显示
    buttonOpenType:'getPhoneNumber',//授权时 拿的信息
    modalIsShow:false,//弹窗是否显示
    movableGrid:[20,20],// 可移动的 群详情入口 的坐标
    scrollIntoView:null,//scroll滚动到的元素
    intoOtherMajorData:{
      startX:0,//开始触摸点
      startY:0,//开始触摸点
      time:0,//滑动时间
      interval:null,//时间计时器
      isSlide:false,//是否滑动
    },//动进入 下一tab/上一tab 的 数据
    showTopBtn:false,//是否显示 回到顶部
    manageSheetClassTapInfo:{}, // 点击课堂列表 右下角 三点 的时候 存的 数据
  },
  /** scroll - view  的 滚动事件 */
  bindScroll: function (event) {
    this.data.showTopBtn = false;
    if (event.detail.scrollTop > 50 ) {
      this.data.showTopBtn = true;
    }
    this.setData({
      showTopBtn: this.data.showTopBtn
    });
  },
  /**滑动进入 下一tab/上一tab 的触摸移动 事件 */
  intoOtherMajorTouchMove:function(event){
    let moveX = event.changedTouches[0].clientX - this.data.intoOtherMajorData.startX;
    let moveY = event.changedTouches[0].clientY - this.data.intoOtherMajorData.startY;
    let isSlide = false;
    //返回角度 /Math.atan()返回数字的反正切值
    let angle = 360 * Math.atan(moveY / moveX) / (2 * Math.PI);
    if(Math.abs(angle) >30 ){//滑动超过30度
      return false;
    }
    let currIndex = -1;
    if(this.data.tabList && this.data.tabList.length>0){
      let tabList = this.data.tabList;
      for(let i=0;i<tabList.length;i++){
        if(tabList[i].majorId == this.data.majorId ){
          currIndex = i;
          break;
        }
      }
    }
    if (moveX < 10 && moveX > -10){
      return false;
    }else if(moveX < -10 && this.data.intoOtherMajorData.time <10){//向左滑动
      if(!this.data.intoOtherMajorData.isSlide){
        this.data.intoOtherMajorData.isSlide = true;
        this.setData({
          ['intoOtherMajorData.isSlide']: this.data.intoOtherMajorData.isSlide
        });
        if((currIndex+1 >=0) && ((currIndex+1) <= (this.data.tabList.length-1))){
          core.globalData.paramsData.courseListTabMajorId = this.data.tabList[currIndex+1].majorId;
          this.data.majorId = this.data.tabList[currIndex+1].majorId;

          this.data.noDataClaIsShow = false;
          this.setData({
            majorId:this.data.majorId,
            noDataClaIsShow:this.data.noDataClaIsShow 
          });
          this.findClassList(this.data.requestPage,false);
        }else{
          core.dialogUtil.showToast({title:'已到最后，请向左滑动'});
          return false;
        }
      }
    }else if(moveX > 10 && this.data.intoOtherMajorData.time <10){//向右滑动
      if(!this.data.intoOtherMajorData.isSlide){
        this.data.intoOtherMajorData.isSlide = true;
        this.setData({
          ['intoOtherMajorData.isSlide']: this.data.intoOtherMajorData.isSlide
        });
        if((currIndex-1 >=0) && ((currIndex-1) <= (this.data.tabList.length-1))){
          core.globalData.paramsData.courseListTabMajorId = this.data.tabList[currIndex-1].majorId;
          this.data.majorId = this.data.tabList[currIndex-1].majorId;

          this.data.noDataClaIsShow = false;
          this.setData({
            majorId:this.data.majorId,
            noDataClaIsShow:this.data.noDataClaIsShow 
          });
          this.findClassList(this.data.requestPage,false);
        }else{
          core.dialogUtil.showToast({title:'滑动到了最前，请向右滑动'});
          return false;
        }
      }
    }
  },
  /**滑动进入 下一tab/上一tab 的触摸开始 事件 */
  intoOtherMajorTouchStart:function(event){
    clearInterval(this.data.intoOtherMajorData.interval);
    this.data.intoOtherMajorData.interval = null;
    this.data.intoOtherMajorData.startX =  event.changedTouches[0].clientX;
    this.data.intoOtherMajorData.startY =  event.changedTouches[0].clientY;
    let that = this;
    this.data.intoOtherMajorData.isSlide = false;
    that.data.intoOtherMajorData.time = 0;
    this.data.intoOtherMajorData.interval = setInterval(function(){
      that.data.intoOtherMajorData.time ++;
    },100);
    this.setData({
      intoOtherMajorData: this.data.intoOtherMajorData
    });
  },
  /**滑动进入 下一tab/上一tab 的触摸结束 事件 */
  intoOtherMajorTouchEnd:function(event){
    clearInterval(this.data.intoOtherMajorData.interval);
    this.data.intoOtherMajorData.startX =  0;
    this.data.intoOtherMajorData.startY = 0 ;
    this.data.intoOtherMajorData.time = 0;
    this.data.intoOtherMajorData.interval = null;
    this.data.intoOtherMajorData.isSlide = false;
    this.setData({
      intoOtherMajorData: this.data.intoOtherMajorData
    });
  },
  /**返回顶部 */
  toBackTop:function(){
    this.data.scrollIntoView = 'class_room_root';
    this.setData({
      scrollIntoView:this.data.scrollIntoView
    });
  },
  /**群详情入口 移动  */
  movableMove:function(event){
    let x = core.globalData.windowWidth - event.changedTouches[0].clientX;
    let y= core.globalData.windowHeight - event.changedTouches[0].clientY;
    if(event.changedTouches[0].clientX <=0 ){
      x = core.globalData.windowWidth - 50;
    }else if(event.changedTouches[0].clientX >=  (core.globalData.windowWidth ) ){
      x = 10;
    }
    if(event.changedTouches[0].clientY <=0 ){
      y = core.globalData.windowHeight - 50;
    }else if(event.changedTouches[0].clientY >=  core.globalData.windowHeight ){
      y = 10;
    }
    this.data.movableGrid[0] = x;
    this.data.movableGrid[1] = y;
    this.setData({
      movableGrid:this.data.movableGrid
    });
  },
  /**群详情入口 移动停止，使靠左或者靠右  */
  movableMoveEnd:function(event){
    let x = core.globalData.windowWidth - event.changedTouches[0].clientX;
    let y = core.globalData.windowHeight - event.changedTouches[0].clientY;
    if(event.changedTouches[0].clientX <= (core.globalData.windowWidth/2)){
      x = core.globalData.windowWidth - 50; 
    }else{
      x = 10;
    }
    if(event.changedTouches[0].clientY <=0 ){
      y = core.globalData.windowHeight - 50;
    }else if(event.changedTouches[0].clientY >=  core.globalData.windowHeight ){
      y = 10;
    }
    this.data.movableGrid[0] = x;
    this.data.movableGrid[1] = y;
    this.setData({
      movableGrid:this.data.movableGrid
    });
  },
  /**收藏或者取消收藏 */
  toOperationColl:function(event){
    if(!core.service.isCanInto()){
      let that = this;
      setTimeout(function(){
        that.setData({
          modalIsShow:true,
          buttonOpenType:'getPhoneNumber'
        })
      },core.globalData.operState.duration)
      return false;
    }
    let ctId = event.currentTarget.dataset.ctid;
    let isCollected = event.currentTarget.dataset.iscollected;
    let that = this;
    let data = {
      ctId:ctId,
    };
    let url = 'wx/classroom-api/collect';
    if(isCollected){
      url = 'wx/classroom-api/cancelCollect';
    }
    core.request({
      url: url,
      method: "GET",
      data:data,
      success: function (res) {
        if (res.data.code === 0) {
          if(res.data.msg){
            core.dialogUtil.showToast({title:res.data.msg})
          }
          that.findClassList(that.data.requestPage,false);
        }
      }
    });
  },
  /**显示邀请码弹窗 */
  toShowQrcode:function(){
    wx.showTabBar();
    this.data.isQrCodeHide = !(this.data.isQrCodeHide);
    this.data.manageSheetHidden = true;
    this.setData({
      isQrCodeHide:this.data.isQrCodeHide,
      manageSheetHidden: this.data.manageSheetHidden
    })
    if(this.data.isQrCodeHide){
      this.data.qrCode = '';
      this.setData({
        qrCode:this.data.qrCode
      })
    }
  },
  /**邀请码 加人 课堂 */
  toJoinKc:function(){
    wx.showTabBar();
    let courseListCurrJoiningRoom = core.globalData.paramsData.courseListCurrJoiningRoom;
    if((!courseListCurrJoiningRoom.isJoined)  && (!courseListCurrJoiningRoom.isOwner)){
      core.globalData.paramsData.courseListCurrJoiningRoom = {};
      core.globalData.paramsData.isFromCourseList = 'true';
      wx.navigateTo({
        url: '/pages/course/codejoin/codejoin',
      })
    }else{
      core.dialogUtil.showToast({title:'当前课堂已加入'});
    }
    this.data.manageSheetHidden = true;
    this.setData({
      manageSheetHidden: this.data.manageSheetHidden
    })
  },
   /**开始或者结束课堂  */
   toOperationClassRoom:function(event){
    let type = event.currentTarget.dataset.type;
    let that = this;
    let data = {
      ctId:(core.globalData.paramsData.ctId)?(core.globalData.paramsData.ctId):'',
    };
    let url = "wx/classroom-api/start";
    let content = "确定开始课堂吗？"
    if(type == 'end'){
      url = "wx/classroom-api/end";
      content = "确定结束课堂吗？"
    }
    core.dialogUtil.showModal({content:content},function() {
      core.request({
        url: url,
        method: "GET",
        data:data,
        success: function (res) {
          if (res.data.code === 0) {
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            that.findClassList(that.data.requestPage,false);
          }
        }
      });
    },function(){});
    wx.showTabBar();
    that.setData({
      manageSheetHidden: true
    })
  },
  /**显示页脚课程管理选项*/
  manageClassTap: function(event) {
    if(!core.service.isCanInto()){
      let that = this;
      setTimeout(function(){
        that.setData({
          modalIsShow:true,
          buttonOpenType:'getPhoneNumber'
        })
      },core.globalData.operState.duration)
      return false;
    }
    
    let type = event.currentTarget.dataset.type
    this.data.manageSheetClassTapInfo = {}
    if(type == 'show'){
      core.globalData.paramsData.ctId = event.currentTarget.dataset.ctid;
      this.data.isTop = event.currentTarget.dataset.istop;
      this.data.classType = event.currentTarget.dataset.classtype;

      let currIndex  = event.currentTarget.dataset.currindex;
      this.data.classList[currIndex].qrCode = core.concatImgUrl(this.data.classList[currIndex].qrCode);
      core.globalData.paramsData.courseListCurrJoiningRoom = this.data.classList[currIndex];
      this.data.qrCode = this.data.classList[currIndex].qrCode;
      this.data.classroomState = (event.currentTarget.dataset.classroomstate)?(event.currentTarget.dataset.classroomstate):'-1';

      this.data.manageSheetClassTapInfo = event.currentTarget.dataset.item

      wx.hideTabBar();
    }else if(type == 'cancel'){
      core.globalData.paramsData.ctId = '';
      this.data.isTop = 'N';
      this.data.classType = '1';
      core.globalData.paramsData.courseListCurrJoiningRoom = {};
      this.data.qrCode = '';
      this.data.classroomState = '-1';

      wx.showTabBar();
    }
    this.setData({
      isTop:this.data.isTop,
      classType:this.data.classType,
      qrCode:this.data.qrCode,
      manageSheetClassTapInfo: this.data.manageSheetClassTapInfo,
      classroomState:this.data.classroomState,
      manageSheetHidden: !this.data.manageSheetHidden
    })
  },
  /**去课堂的详情页 活动 */
  toClassRoomDetail:function(event){
    if(!core.service.isCanInto()){
      let that = this;
      setTimeout(function(){
        that.setData({
          modalIsShow:true,
          buttonOpenType:'getPhoneNumber'
        })
      },core.globalData.operState.duration)
      return false;
    } 
    let currIndex  = event.currentTarget.dataset.currindex;
    if(this.data.classList[currIndex].isCheck =='Y' && this.data.classList[currIndex].isApply && !this.data.classList[currIndex].isPass &&  !this.data.classList[currIndex].isOwner){
      if ( this.data.classList[currIndex].classroomState && this.data.classList[currIndex].classroomState == '3' ) {
        core.dialogUtil.showToast({title:'该课堂已结束'});
        return false;
      }
      
      core.globalData.paramsData.courseListCurrJoiningRoom = this.data.classList[currIndex];
      core.globalData.paramsData.isFromCourseList = 'true';
      wx.navigateTo({
        url: '/pages/course/codejoin/codejoin',
      })
      // core.dialogUtil.showToast({title:'此课堂老师还未通过你的审核，请耐心等待'});
      return false;
    }
    //hasJoined布尔值，是否加入课堂：true已加入false未加入  isJoined?'Y':'N' 
    let hasJoined =  (this.data.classList[currIndex].isJoined) ?'Y':'N' ;
    let classType =  (this.data.classList[currIndex].isOwner) ?'2':'1';
    if(hasJoined == 'N' && classType == '1'){
      if ( this.data.classList[currIndex].classroomState && this.data.classList[currIndex].classroomState == '3' ) {
        core.dialogUtil.showToast({title:'该课堂已结束'});
        return false;
      }

      // core.globalData.paramsData.courseListCurrJoiningRoom = this.data.classList[currIndex];
      core.globalData.paramsData.isFromCourseList = 'true';
      // core.dialogUtil.showToast({title:'当前未加入该课堂，请先申请加入课堂',mask:'true'});
      // setTimeout(function(){
        wx.navigateTo({
          url: '/pages/course/codejoin/codejoin',
        })
      // },core.globalData.operState.duration)
      return false;
    }

    core.globalData.paramsData.pkgId = this.data.classList[currIndex].pkgId;
    core.globalData.paramsData.ctId = this.data.classList[currIndex].ctId;
    core.globalData.paramsData.subjectId = this.data.classList[currIndex].subjectId;
    core.globalData.paramsData.classId = this.data.classList[currIndex].classId;

    core.globalData.paramsData.classType  = classType;
    core.globalData.paramsData.classroomState = this.data.classList[currIndex].classroomState;

    
    core.globalData.paramsData.activityIndex = 1;//活动状态
    if(core.globalData.paramsData.classType == '2'){
      core.globalData.paramsData.classroomIdentity = 'teacher';
    } else {
      core.globalData.paramsData.classroomIdentity = 'student';
    }

    if (this.data.classList[currIndex].teachingAssistantId && this.data.classList[currIndex].teachingAssistantId == core.globalData.myInfo.basicInfo.traineeId) { // 是助教
      
      core.globalData.paramsData.classroomIdentity = 'assistant';
      core.globalData.paramsData.classType = '2';
      core.globalData.paramsData.isAssistant = '1'; // 1是助教 

      // core.globalData.paramsData.permsList = [];
      // let that = this;
      // core.request({
      //   url: 'wx/classroom-api/queryPermissionList',
      //   method: "post",
      //   data:{
      //     ctId: that.data.classList[currIndex].ctId
      //   },
      //   success: function (res) {
      //     if (res.data.code == 0 && res.data.data && res.data.data.length > 0) {
      //       core.globalData.paramsData.permsList = res.data.data;
      //     }
      //     wx.navigateTo({
      //       url: '/pages/classroom/resource/resource',
      //     })
      //   },
      //   fail: function () {
      //     wx.navigateTo({
      //       url: '/pages/classroom/resource/resource',
      //     })
      //   },
      // });
      wx.navigateTo({
        url: '/pages/classroom/resource/resource',
      })
    } else {
      wx.navigateTo({
        url: '/pages/classroom/resource/resource',
      })
    }

  },
  /**输入框模糊查询 */
  bindinput:function(event){
    this.data.listName = event.detail.value;
    this.setData({
      listName:this.data.listName
    })
    // this.findClassList(this.data.requestPage,false);
  },
  /**搜索 活动 */
  searchInput:function(){
    this.findClassList(this.data.requestPage,false);
  },
  /**去切换 */
  toTab:function(event) {
    core.globalData.paramsData.courseListTabMajorId = event.currentTarget.dataset.majorid;
    this.data.majorId = event.currentTarget.dataset.majorid;

    this.data.noDataClaIsShow = false;
    this.data.showTopBtn = false;
    this.setData({
      majorId:this.data.majorId,
      showTopBtn: this.data.showTopBtn,
      noDataClaIsShow:this.data.noDataClaIsShow 
    });
    this.findClassList(this.data.requestPage,false);
  },
  /**获取 tab列表 */
  findTabList:function(otherObj = {}){
    let that = this;
    let isShowLoading = 'true'
    if (otherObj && otherObj.isLoad && otherObj.isLoad == 'false' ) {
      isShowLoading = 'false'
    }
    core.request({
      url: "wx/classroom-api/getAllBookMajorList",
      method: "GET",
      isShowLoading: isShowLoading,
      data:{
        type:'countClassroomNum'
      },
      success: function (res) {
        if (res.data.code === 0) {
          that.data.tabList = [];
          if(res.data.data && res.data.data.length>0){
            that.data.tabList = res.data.data;
            //返回该页面时上回的操作保存
            that.data.majorId = (core.globalData.paramsData.courseListTabMajorId)?(core.globalData.paramsData.courseListTabMajorId): (res.data.data[0].majorId);
            core.globalData.paramsData.courseListTabMajorId = that.data.majorId;
            that.setData({
              majorId:that.data.majorId
            })
          }
          that.setData({
            tabList:that.data.tabList
          })
          that.findClassList(that.data.requestPage,false, otherObj);
        }
      }
    });
  },
  /**获取 课堂列表  */
  findClassList:function(requestPage, isLazy, otherObj= {}){
    let that = this;
    that.data.noDataClaIsShow = false;
    that.setData({
      noDataClaIsShow:that.data.noDataClaIsShow 
    });
    let data = {
      pageNum: requestPage.pageNum,
      pageSize: requestPage.pageSize,
      type:'',
      majorId:this.data.majorId,
      name:this.data.listName,
    };
    if (!isLazy) {
      data.pageNum = 1
    }
    if(!data.majorId){
      return false;
    }
    let isShowLoading = 'true'
    if (otherObj && otherObj.isLoad && otherObj.isLoad == 'false' ) {
      isShowLoading = 'false'
    }
    core.request({
      url: "wx/index-api/showClassroomList",
      method: "GET",
      isShowLoading: isShowLoading,
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if (!isLazy) {
            that.data.classList = []
          }
          let ss = []
          if(res.data.data && res.data.data.list && res.data.data.list.length>0){
            ss = res.data.data.list
            for (let i = 0; i < ss.length; i++) {
              ss[i].pic = core.concatImgUrl(ss[i].pic);
               //教师头像和名字
              ss[i].teacherPic = core.concatImgUrl(ss[i].teacherPic);
              //教辅头像和名字
              ss[i].traineePic = core.concatImgUrl(ss[i].traineePic);

              that.data.classList.push(ss[i]);
            }
          }
          that.setData({
            classList: that.data.classList
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
        if(!that.data.classList || (that.data.classList && that.data.classList.length<1)){
          that.data.noDataClaIsShow = true;
          that.setData({
            noDataClaIsShow:that.data.noDataClaIsShow 
          });
        }
      },
      fail:function(){
        if(!that.data.classList || (that.data.classList && that.data.classList.length<1)){
          that.data.noDataClaIsShow = true;
          that.setData({
            noDataClaIsShow:that.data.noDataClaIsShow 
          });
        }
      }
    });
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
    let that = this;
    wx.showTabBar();
    // this.findTabList();
    //对全局变量进行处理
    core.globalData.paramsData.pkgId = '';
    core.globalData.paramsData.ctId = '';
    core.globalData.paramsData.subjectId = '';
    core.globalData.paramsData.classType = '';
    core.globalData.paramsData.classId = '';
    core.globalData.paramsData.isFromCourseList = '';
    core.globalData.paramsData.courseListCurrJoiningRoom = {};
    core.globalData.paramsData.qrCodeOptionsData = {};
    core.globalData.paramsData.classroomState = '';
    core.globalData.paramsData.postId = '';
    core.globalData.paramsData.replyPages = '';
    core.globalData.paramsData.classroomIdentity = '';
    core.globalData.paramsData.isAssistant = '';
    core.globalData.paramsData.permsList = [];


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.manageSheetHidden = true;
    this.setData({
      manageSheetHidden:this.data.manageSheetHidden
    });
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
  /**scroll-view 滚动到底部或者右边的事件 */
  bindScrollToLower:function(){
    let pageNum = parseInt(this.data.requestPage.pageNum) + 1;
    if (pageNum <= parseInt(this.data.requestPage.pages)) {
      this.data.requestPage.pageNum = pageNum;
      this.findClassList(this.data.requestPage, true);
      this.setData({
        ['requestPage.pageNum']: this.data.requestPage.pageNum
      })
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.bindScrollToLower();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**删除课堂 */
  toDelKc:function(event){
    let that = this;
    if(!core.globalData.paramsData.ctId){
      return false;
    }
    core.dialogUtil.showModal({content:'确定删除吗？'},function() {
      let data = {
        ctId:core.globalData.paramsData.ctId
      };
      core.request({
        url: "wx/classroom-api/deleteClassroom",
        method: "POST",
        data:data,
        success: function (res) {
          if (res.data.code === 0) {
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            wx.showTabBar();
            that.findClassList(that.data.requestPage,false);
            that.setData({
              manageSheetHidden: true
            })
          }
        }
      });
    },function() {});
  },
  //创建课程
  toCreateKc: function (e) {
    wx.showTabBar();
    wx.navigateTo({
      url: '/pages/course/createkc/createkc'
    })
    core.globalData.paramsData.isFromCourseList = 'true';
    this.setData({
      manageSheetHidden: true
    })
  }



})