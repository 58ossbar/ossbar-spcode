// pages/tabbar/home/home.js
const app = getApp()
const core = require("../../../utils/core/core.js")
 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    modalIsShow:false,//弹窗是否显示
    lunbo: [],//轮播图列表数组
    actionSheetHidden: true,//创建课堂 页脚选项 是否隐藏
    manageSheetHidden: true,//页脚课程管理选项  是否隐藏
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listenClass: [], //我听的课
    listenTotalCount: 0,//我听的课数量
    teachClass: [], //我教的课
    teachTotalCount: 0,//我教的课数量
    requestPage: {
      pageNum: 1,//当前第几页
      pageSize: 10//每页多少条
    },//我教的课or我听的课 页面 数据
    classroomState:'-1',//课堂的状态
    buttonOpenType:'getUserInfo',//授权时 拿的信息
    waveBga:'',//水波浪背景图a
    waveBgb:'',//水波浪背景图b
    listName:'',//搜索名称
    noDataTeaIsShow:false,//我教的课 暂无数据是否显示
    noDataLisIsShow:false, //我听的课 暂无数据是否显示
    isTeacher:false,//是否是老师，用于判断 是否可以创建课堂
    movableGrid:[20,20],// 可移动的 群详情入口 的坐标
    showTopBtn:false,//是否显示 回到顶部
    manageSheetClassTapInfo:{}, // 点击课堂列表 右下角 三点 的时候 存的 数据
  },
  // 轮播图 跳转
  toClickAvdLink:function (event) {
    let currIndex = event.currentTarget.dataset.currindex;
    if (this.data.lunbo[currIndex] && this.data.lunbo[currIndex].avdLinkhref) {
      let url = this.data.lunbo[currIndex].avdLinkhref;
      if (core.stringUtil.startWith(url, "#")) {
      } else {
        if (core.stringUtil.contains(url, "://")) {
          wx.navigateTo({
            url: '/pages/other/linktowebview/linktowebview?webViewSrc='+ encodeURIComponent(url),
          })
        } else {
          wx.navigateTo({
            url: url,
          })
        }
      }
    }
  },
  /** 监听用户滑动页面事件
  option.scrollTop	页面在垂直方向已滚动的距离（单位px） */
  onPageScroll:function (option) {
    this.data.showTopBtn = false;
    if (option.scrollTop > 200) {
      this.data.showTopBtn = true;
    }
    this.setData({
      showTopBtn: this.data.showTopBtn
    });
  },
  /**返回顶部 */
  toBackTop:function(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //将本地图片转为base64位格式，作为背景图
    this.data.waveBga = 'data:image/png;base64,'+ wx.getFileSystemManager().readFileSync('/images/wave_a.png', 'base64');
    this.data.waveBgb = 'data:image/png;base64,'+ wx.getFileSystemManager().readFileSync('/images/wave_b.png', 'base64');
    this.data.listName = '';
    this.setData({
      waveBga:this.data.waveBga,
      waveBgb:this.data.waveBgb,
      listName: this.data.listName
    })
    
    //扫码带来的数据
    if(options && options.scene){
      let scene = decodeURIComponent(options.scene)
      if(scene){
        let da = {};
        let pas = scene.split("&");
        for(let i=0; i<pas.length; i++){
          let tem = pas[i].split("=");
          da[tem[0]] = tem[1];
        }
        core.globalData.paramsData.qrCodeOptionsData = da
      }
    }else{
      core.globalData.paramsData.qrCodeOptionsData = options;
    }

     //获取轮播图数据
     this.findLunBoList();
     // 判断是否授权 并清空全局变量
    let that = this;

    //对 我教的课 还是 我听的课  进行赋值
    that.data.classType = (core.globalData.paramsData.classType)?(core.globalData.paramsData.classType):'2';
    that.setData({
     classType:that.data.classType
   });

    core.service.judgeIsAuthorize('home',function(suc){
      that.authorizedFun(suc, false, true);
    },function(){
    });
  },
  /**获取轮播图数据 */
  findLunBoList: function(){
    let that = this
    core.request({
      url: "wx/index-api/showAvd",
      method: "GET",
      isShowLoading:'false',
      needToken:false,
      success: function(res) {
        if (res.data.code === 0) {
          let ss = []
          if(res.data.data && res.data.data.length>0){
            ss = res.data.data
            for (let i = 0; i < ss.length; i++) {
              ss[i].avdPicurl = core.concatImgUrl(ss[i].avdPicurl);
            }
          }
          that.data.lunbo = ss
          that.setData({
            lunbo: that.data.lunbo
          })
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
  },
  /**微信授权弹窗点击确定 进行用户授权 */
  getUserInfo: function(event) {
     // 用户点击授权后，这里可以做一些登陆操作
     let that = this
    core.service.authorizeGetUserInfoComm(event,function(suc){
      that.authorizedFun(suc);
    },function(){
      wx.reLaunch({
        url: '/pages/tabbar/home/home',
      })
    })
  },
  /**已授权要做的事情 */
  authorizedFun:function(isQrcode, isOnShow = true, isOnLoad = true){
    let that = this;
    //对扫码进入小程序进行处理， 类型和 邀请码、时间  ，跳到课堂里面
    // t：为type调整类型的简称，01表示跳课堂; c：为code邀请码的简称;  e:为time时间的简称，示例：20200724162900
    //获取个人信息
    core.service.findUserInfoFromMysal({isShowLoading:'false'},function(suc){
      that.data.isTeacher =   (suc.isTeacher)?true:false;
      that.setData({
        isTeacher:that.data.isTeacher
      });
      core.globalData.myInfo = suc.data;
    if (isOnLoad) {

      if(isQrcode &&  core.stringUtil.objectIsNotNull(core.globalData.paramsData.qrCodeOptionsData) && core.globalData.paramsData.qrCodeOptionsData.t){
        if(!core.service.isCanInto()){
          setTimeout(function(){
            that.setData({
              modalIsShow:true,
              buttonOpenType:'getPhoneNumber'
            })
          },core.globalData.operState.duration);
          return false;
        }
        that.qrCodeIntoClassroom(core.globalData.paramsData.qrCodeOptionsData);//扫码加入课堂
      }else{
         //获取我教的课数据
        that.findTeachingOrListeningClassList(that.data.requestPage, false);
         
      }

    }
    });
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() { 
    // core.globalData.userInfo.token = 'b44584db-1bdb-4998-9b93-55040f6753c2' //  '3090e980ae70448b8d8c510c7e1b2c38'//'e89d9275-70b7-4e26-8c2c-85e14d065625' // '3b39b856-5f1b-40b2-a694-02c740a93d0a'

    wx.showTabBar();
    // //获取轮播图数据
    // this.findLunBoList();

    // 判断是否授权 并清空全局变量
    let that = this;
    core.service.judgeIsAuthorize('home',function(suc){
      that.authorizedFun(suc, true, false);
    },function(){
      that.setData({
        modalIsShow:true,
        buttonOpenType:'getUserInfo'
      })
    });
  },
  /**登录成功后的事件 */
  getPhoneNumberBack:function(){
    if( core.stringUtil.objectIsNotNull(core.globalData.paramsData.qrCodeOptionsData) && core.globalData.paramsData.qrCodeOptionsData.t){
      this.qrCodeIntoClassroom(core.globalData.paramsData.qrCodeOptionsData);//扫码加入课堂
    }
  },
  /**扫码加入课堂 */
  qrCodeIntoClassroom:function(params){
    let that = this;
    let data = {
      invitationCode:  core.stringUtil.trim(params.c) , //'406401',//
      createTime:  core.stringUtil.trim(params.e) //'20200724092046'//
    };
    core.request({
      url: "wx/classroom-api/joinTheClassroom",
      data:data,
      success: function (res) {
        if (res.data.code === 0) {
          core.globalData.paramsData.pkgId = (res.data.data && res.data.data.pkgId)?(res.data.data.pkgId):'';
          core.globalData.paramsData.ctId = (res.data.data && res.data.data.ctId)?(res.data.data.ctId):'';
          core.globalData.paramsData.subjectId = (res.data.data && res.data.data.subjectId)?(res.data.data.subjectId):'';
          core.globalData.paramsData.classId = (res.data.data && res.data.data.classId)?(res.data.data.classId):'';
          core.globalData.paramsData.classType = '1';
          that.data.classType = '1';
          that.setData({
            classType:that.data.classType
          })

          if(res.data.data && res.data.data.code === 520){
            if(res.data.data.msg){
              core.dialogUtil.showToast({title:res.data.data.msg})
            }
            setTimeout(function(){
              that.authorizedFun(false);
            },core.globalData.operState.duration)
          }else{
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            core.globalData.paramsData.classroomIdentity = 'student';
            wx.navigateTo({
              url: '/pages/classroom/resource/resource',// classroom  stuactivity
            })
            
          }
          
        }else{
          setTimeout(function(){
            that.authorizedFun(false);
          },core.globalData.operState.duration)
          
        }
        core.globalData.paramsData.qrCodeOptionsData = {};
      }
    });
    
  },
  //跳转到课程活动-学生端
  toStuActivityKc: function (e) {
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
    let currIndex = e.currentTarget.dataset.currindex;
    if(this.data.listenClass[currIndex].isCheck =='Y' && this.data.listenClass[currIndex].isApply && !this.data.listenClass[currIndex].isPass &&  !this.data.listenClass[currIndex].isOwner ){

      if ( this.data.listenClass[currIndex].classroomState && this.data.listenClass[currIndex].classroomState == '3' ) {
        core.dialogUtil.showToast({title:'该课堂已结束'});
        return false;
      }

      core.globalData.paramsData.courseListCurrJoiningRoom = this.data.listenClass[currIndex];
      wx.navigateTo({
        url: '/pages/course/codejoin/codejoin',
      })
      // core.dialogUtil.showToast({title:'此课堂老师还未通过你的审核，请耐心等待'});
      return false;
    }
    core.globalData.paramsData.pkgId = this.data.listenClass[currIndex].pkgId;
    core.globalData.paramsData.ctId = this.data.listenClass[currIndex].ctId;
    core.globalData.paramsData.subjectId = this.data.listenClass[currIndex].subjectId;
    core.globalData.paramsData.classId = this.data.listenClass[currIndex].classId;

    
    core.globalData.paramsData.messagingType = '';
    core.globalData.paramsData.classroomState = this.data.listenClass[currIndex].classroomState;
    core.globalData.paramsData.classroomIdentity = 'student';

    core.globalData.paramsData.activityIndex = 1;//活动状态

    if (this.data.listenClass[currIndex].teachingAssistantId && this.data.listenClass[currIndex].teachingAssistantId == core.globalData.myInfo.basicInfo.traineeId) { // 是助教
      
      core.globalData.paramsData.classroomIdentity = 'assistant';
      core.globalData.paramsData.classType = '2';
      core.globalData.paramsData.isAssistant = '1'; // 1是助教 
      

      core.globalData.paramsData.permsList = [];
 
      wx.navigateTo({
        url: '/pages/classroom/resource/resource',
      })
    } else {
      core.globalData.paramsData.classType = '1';
      wx.navigateTo({
        url: '/pages/classroom/resource/resource',
      })
    }
    
  },
  //跳转到课程活动
  toActivityKc: function(event) {
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
    let currIndex = event.currentTarget.dataset.currindex;
    core.globalData.paramsData.classroomState = this.data.teachClass[currIndex].classroomState;
    core.globalData.paramsData.pkgId = this.data.teachClass[currIndex].pkgId;
    core.globalData.paramsData.ctId = this.data.teachClass[currIndex].ctId;
    core.globalData.paramsData.subjectId = this.data.teachClass[currIndex].subjectId;
    core.globalData.paramsData.classId = this.data.teachClass[currIndex].classId;
    core.globalData.paramsData.classType = '2';
    core.globalData.paramsData.activityIndex = 1;//活动状态
    core.globalData.paramsData.classroomIdentity = 'teacher';

    wx.navigateTo({
      url: '/pages/classroom/resource/resource',
    })
  },
  /**输入框模糊查询 */
  bindinput:function(event){
    this.data.listName = event.detail.value;
    this.setData({
      listName:this.data.listName
    })
    // this.findTeachingOrListeningClassList(this.data.requestPage,false);
  },
  /**搜索 活动 */
  searchInput:function(){
    this.findTeachingOrListeningClassList(this.data.requestPage,false);
  },
  /**获取 我教的课/我听的课  */
  findTeachingOrListeningClassList:function(requestPage, isLazy, otherObj= {}){
    let that = this;
    that.data.noDataTeaIsShow = false;
    that.data.noDataLisIsShow = false;
    that.setData({
      noDataTeaIsShow:that.data.noDataTeaIsShow,
      noDataLisIsShow:that.data.noDataLisIsShow
    });
    let data = {
      pageNum: requestPage.pageNum,
      pageSize: requestPage.pageSize,
      type:'',
      name:this.data.listName,
    };
    // 1加入的课堂（我听的课）2自己创建的课堂（我教的课），默认我教的课
    data.type = '2'
    let listName = 'teach';
    let nodataName = 'noDataTeaIsShow';
    let url = "wx/index-api/showClassroomList";
    if (!this.data.isTeacher && (!core.globalData.paramsData.classType || core.globalData.paramsData.classType == '2')) {
      core.globalData.paramsData.classType = '1'; // findUserInfoFromMysal
      this.setData({
        classType: core.globalData.paramsData.classType
      });
    }
    if(core.globalData.paramsData.classType && core.globalData.paramsData.classType == '1'){//我听的课
      data.type = '1'
      listName = 'listen'
      nodataName = 'noDataLisIsShow';
    }
    if (!isLazy) {
      data.pageNum = 1;
      that.data[listName+'Class'] = [];
      that.setData({
        [listName+'Class']: that.data[listName+'Class']
      })
    }
    let isShowLoading = 'true'
    if (otherObj && otherObj.isLoad && otherObj.isLoad == 'false' ) {
      isShowLoading = 'false'
    }

    core.request({
      url: url,
      method: "GET",
      data: data,
      isShowLoading: isShowLoading,
      success: function(res) {
        if (res.data.code === 0) {
          if (!isLazy) {
            that.data[listName+'Class'] = []
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
              that.data[listName+'Class'].push(ss[i]);
            }
          }

          that.data.teachTotalCount = (res.data.otherInfo &&  res.data.otherInfo.teachNum)?(res.data.otherInfo.teachNum):0;
          that.data.listenTotalCount = (res.data.otherInfo &&  res.data.otherInfo.lecturesNum)?(res.data.otherInfo.lecturesNum):0;
          that.setData({
            [listName+'Class']: that.data[listName+'Class'],
            teachTotalCount: that.data.teachTotalCount,
            listenTotalCount: that.data.listenTotalCount
          })
          if(res.data.data && res.data.data.pageNum){
            res.data.data.currPage = res.data.data.pageNum
          }
          if(res.data.data && res.data.data.pages){
            res.data.data.totalPage = res.data.data.pages
          }
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

        if(!that.data[listName+'Class'] || ( that.data[listName+'Class'] && that.data[listName+'Class'].length<1)  ){
          that.data[nodataName] = true;
          that.setData({
            [nodataName]:that.data[nodataName] 
          });
        }

      },
      fail:function(){
        if(!that.data[listName+'Class'] || ( that.data[listName+'Class'] && that.data[listName+'Class'].length<1)  ){
          that.data[nodataName] = true;
          that.setData({
            [nodataName]:that.data[nodataName] 
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.data.actionSheetHidden = true;
    this.data.manageSheetHidden = true;
    this.setData({
      actionSheetHidden:this.data.actionSheetHidden,
      manageSheetHidden:this.data.manageSheetHidden
    });
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
    let pageNum = parseInt(this.data.requestPage.pageNum) + 1;
    if (pageNum <= parseInt(this.data.requestPage.pages)) {
      this.data.requestPage.pageNum = pageNum;
      this.findTeachingOrListeningClassList(this.data.requestPage, true);
      this.setData({
        ['requestPage.pageNum']: this.data.requestPage.pageNum
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**显示页脚选项*/
  actionSheetTap: function() {
    core.globalData.paramsData.ctId = '';
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
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
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
            that.findTeachingOrListeningClassList(that.data.requestPage, false);
          }
        }
      });
    },function() {});
    wx.showTabBar();
    that.setData({
      manageSheetHidden: true
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
            that.findTeachingOrListeningClassList(that.data.requestPage, false);
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
      this.data.classroomState = (event.currentTarget.dataset.classroomstate)?(event.currentTarget.dataset.classroomstate):'-1';

      this.data.manageSheetClassTapInfo = event.currentTarget.dataset.item

      wx.hideTabBar();
    }else if(type == 'cancel'){
      core.globalData.paramsData.ctId = '';
      this.data.isTop = 'N';
      this.data.classroomState = '-1';
      wx.showTabBar();
    }
    this.setData({
      isTop:this.data.isTop,
      classroomState:this.data.classroomState,
      manageSheetClassTapInfo: this.data.manageSheetClassTapInfo,
      manageSheetHidden: !this.data.manageSheetHidden
    })
  },

  //创建课程
  toCreateKc: function(e) {

    wx.showTabBar();
    
    this.setData({
      manageSheetHidden:true
    })
    if(!this.data.isTeacher){
      core.dialogUtil.showToast({title:'还未开通新建【课堂】授权，请联系管理员！'});
      return false;
    }
    this.setData({
      actionSheetHidden: true
    })
    wx.navigateTo({
      url: '/pages/course/createkc/createkc',
    })
  },
  //邀请码加入
  toJoinKc: function(e) {
    wx.showTabBar();
    wx.navigateTo({
      url: '/pages/course/codejoin/codejoin',
    })
    this.setData({
      actionSheetHidden: true
    })
  },

  //显示收藏视频
  showTeach: function(e) {
    this.data.classType = '2';
    core.globalData.paramsData.classType = '2';
    this.data.noDataTeaIsShow = false;
    this.data.noDataLisIsShow = false;
    this.setData({
      noDataTeaIsShow:this.data.noDataTeaIsShow,
      noDataLisIsShow:this.data.noDataLisIsShow,
      classType:this.data.classType
    });

    this.findTeachingOrListeningClassList(this.data.requestPage, false);

  },
  //显示收藏课程
  showHear: function(e) {
    this.data.classType = '1';
    core.globalData.paramsData.classType = '1';
    this.data.noDataTeaIsShow = false;
    this.data.noDataLisIsShow = false;
    this.setData({
      noDataTeaIsShow:this.data.noDataTeaIsShow,
      noDataLisIsShow:this.data.noDataLisIsShow,
      classType:this.data.classType
    });
    this.findTeachingOrListeningClassList(this.data.requestPage, false);

  },
  /** tab 的 点击事件 */
  tabClick: function(event) {
    let classType = event.currentTarget.dataset.classtype;
    this.data.classType = classType;
    core.globalData.paramsData.classType = classType;
    this.setData({
      classType:this.data.classType
    });
    this.findTeachingOrListeningClassList(this.data.requestPage, false);

  },
  //跳转到课堂列表
  toCourseList: function(e) {
    wx.reLaunch({
      url: '/pages/tabbar/courselist/courselist'
    })
  }

  
   
})