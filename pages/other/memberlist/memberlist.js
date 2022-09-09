// pages/other/memberlist/memberlist.js
const app = getApp();
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkBtn: true,//是否显示全选按钮
    classId:'',//班级id
    traineeList:[],//班级学员基础列表
    traineeName:'',//搜索内容
    checkedNum:0,//已选择的人
    backEventType:'',//上一页的要做的事情的类型
    ctId:'',//课堂id
    gpId:'',//分组id
    groupName:'',//分组名称
    requestPage: {
      pageNum: 1,//当前第几页
      pageSize: 15//每页多少条
    },//页面 数据
    noDataMelIsShow:false,//暂无数据是否显示
    isShowConfirmBtns: true, // 是否显示确定按钮
    classroomState:'',//课堂的状态
    onlyWatchActivityInfo:false,//是否查看信息
    soure:'teachactivity',//上一个页面是学生版的还是老师版的
    currTraineeIndex:-1,//当前 选中的学员的 的下标
  },
  /**输入框模糊查询 */
  bindinput:function(event){
    this.data.traineeName = event.detail.value;
    this.setData({
      traineeName:this.data.traineeName
    })
    // this.listClassTrainee(this.data.requestPage, false);
  },
  /**搜索 */
  searchInput:function(){
    this.data.checkBtn = true;
    this.data.checkedNum = 0;
    this.setData({
      checkBtn:this.data.checkBtn,
      checkedNum:this.data.checkedNum
    })
    this.listClassTrainee(this.data.requestPage, false);
  },
  /**勾选 成员 */
  checkboxChange:function(event){
    if(this.data.traineeList && this.data.traineeList.length>0){
      for(let a=0;a<this.data.traineeList.length;a++){
        this.data.traineeList[a].isChecked = false;
      }
    }
    let valueList = event.detail.value;
    if(valueList && valueList.length>0){
      for(let a1=0;a1<valueList.length;a1++){
        this.data.traineeList[valueList[a1]].isChecked = true;
      }
    }
    
    this.data.checkedNum = (valueList && valueList.length>0)?(valueList.length):0;
    this.data.checkBtn = true
    if( (valueList) && (valueList.length>0) && (valueList.length == this.data.traineeList.length)){
      this.data.checkBtn = false
    }
    this.setData({
      checkedNum:this.data.checkedNum,
      checkBtn:this.data.checkBtn,
      traineeList:this.data.traineeList
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.gpId = (options && options.gpId)?(options.gpId):'';

    this.data.groupName = (options && options.groupName)?(options.groupName):'';

    this.data.classroomState =  (options && options.classroomState)?(options.classroomState):((core.globalData.paramsData.classroomState)?(core.globalData.paramsData.classroomState):'');
    
    this.data.classId = (core.globalData.paramsData.classId)?(core.globalData.paramsData.classId):'',

    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.backEventType = (core.globalData.paramsData.memberListEventType)?(core.globalData.paramsData.memberListEventType):'';

    this.data.soure =  (core.globalData.paramsData.classType && core.globalData.paramsData.classType == '1') ? 'stuactivity':'teachactivity';  // (options && options.soure)? (options.soure):'teachactivity';

    this.data.isShowConfirmBtns = true;

    this.data.onlyWatchActivityInfo =  (options && options.onlyWatchActivityInfo && options.onlyWatchActivityInfo == 'true')?(true):((core.globalData.paramsData.onlyWatchActivityInfo && core.globalData.paramsData.onlyWatchActivityInfo =='true' )?(true):false);

    if (this.data.onlyWatchActivityInfo) {
      this.data.isShowConfirmBtns = false;
    }


    this.setData({
      soure:this.data.soure,
      gpId:this.data.gpId,
      groupName:this.data.groupName,
      classId:this.data.classId,
      classroomState:this.data.classroomState,
      ctId:this.data.ctId,
      backEventType:this.data.backEventType,
      onlyWatchActivityInfo:this.data.onlyWatchActivityInfo,
      isShowConfirmBtns:this.data.isShowConfirmBtns
    });
    this.listClassTrainee(this.data.requestPage, false);
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
      this.listClassTrainee(this.data.requestPage, true);
      this.setData({
        ['requestPage.pageNum']: this.data.requestPage.pageNum
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**全选或者取消 */
  allCancel: function () {
    this.data.checkBtn = !(this.data.checkBtn);
    this.data.checkedNum = (!this.data.checkBtn)?(this.data.traineeList.length):0;
    if(this.data.traineeList && this.data.traineeList.length>0){
      for(let a=0;a<this.data.traineeList.length;a++){
        this.data.traineeList[a].isChecked = !(this.data.checkBtn);
      }
    }
    this.setData({
      checkBtn: this.data.checkBtn,
      checkedNum:this.data.checkedNum,
      traineeList:this.data.traineeList
    })
  },
  /**点击确定 */
  toConfirm:function(){
    if(this.data.backEventType == 'addMember'){
      this.addMember();
    }else if(this.data.backEventType == 'toNotice'){
      this.toNotice();
    }
  },
  /**获取未加入课堂的学员列表信息 */
  listClassTrainee:function(requestPage, isLazy){
    let that = this;
    if (!isLazy) {
      that.data.traineeList = [];
    }
    that.data.noDataMelIsShow = false;
    that.setData({
      traineeList:that.data.traineeList,
      noDataMelIsShow:that.data.noDataMelIsShow
    });
    let data = {
      pageNum: requestPage.pageNum,
      pageSize: requestPage.pageSize,
      ctId:this.data.ctId,
      classId:this.data.classId,
      traineeName:this.data.traineeName
    };
    //默认是课堂成员模块 添加成员
    let url = "wx/classroom-trainee-api/listClassTrainee";
    let method = 'GET';
    let titleNav = '添加成员';
    if(this.data.backEventType == 'toNotice'){ // 通知活动 --选择收件人
      url = "wx/classroom-trainee-api/listClassroomTrainee";
      titleNav = '选择收件人';
      data.classId = '';
    }
    wx.setNavigationBarTitle({//动态设置当前页面的标题
      title: titleNav
    })
    if (!isLazy) {
      data.pageNum = 1
    }
    core.request({
      url:url,
      method:method,
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
         
          if (!isLazy) {
            that.data.traineeList = []
          }
          if(res.data.data && res.data.data.list && res.data.data.list.length>0){
            let ss =  res.data.data.list;
            for(let a=0;a<ss.length;a++){
              ss[a].traineePic = core.concatImgUrl(ss[a].traineePic);
              ss[a].isChecked = false;

              if(ss[a].traineeId && that.data.backEventType == 'toNotice' && core.globalData.noticeData && core.globalData.noticeData.traineeIds && core.globalData.noticeData.traineeIds.length>0){
                let noticeTraineeIds = core.globalData.noticeData.traineeIds
                for(let n=0;n<noticeTraineeIds.length;n++){
                  if(noticeTraineeIds[n] == ss[a].traineeId){
                    ss[a].isChecked = true;
                    break;
                  }
                }
              }

              that.data.traineeList.push(ss[a]);
            }
          }
          that.setData({
            traineeList:that.data.traineeList
          });
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
        if(!that.data.traineeList || (that.data.traineeList && that.data.traineeList.length<1)){
          that.data.noDataMelIsShow = true;
          that.setData({
            noDataMelIsShow:that.data.noDataMelIsShow
          });
        }
      },
      fail:function(){
        if(!that.data.traineeList || (that.data.traineeList && that.data.traineeList.length<1)){
          that.data.noDataMelIsShow = true;
          that.setData({
            noDataMelIsShow:that.data.noDataMelIsShow
          });
        }
      }
    });
  },
  /**发送通知选择收件人 */
  toNotice:function(){
    core.globalData.noticeData.traineeIds = [];
    core.globalData.noticeData.traineeNames = '';
    if(this.data.traineeList && this.data.traineeList.length>0){
      for(let a=0;a<this.data.traineeList.length;a++){
        if(this.data.traineeList[a].isChecked){
          core.globalData.noticeData.traineeIds.push(this.data.traineeList[a].traineeId);
          core.globalData.noticeData.traineeNames += (this.data.traineeList[a].traineeName + ',');
        }
      }
    }
    core.globalData.noticeData.traineeNames = core.globalData.noticeData.traineeNames.slice(0,core.globalData.noticeData.traineeNames.length-1);
    if(core.globalData.noticeData.traineeIds.length<1){
      core.dialogUtil.showToast({title:'当前未选择成员'});
      return false;
    }
    core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
  },
  /**添加成员 */
  addMember:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      classId:this.data.classId,
    };
    data.traineeIds = [];
    if(this.data.traineeList && this.data.traineeList.length>0){
      for(let a=0;a<this.data.traineeList.length;a++){
        if(this.data.traineeList[a].isChecked){
          data.traineeIds.push(this.data.traineeList[a].traineeId);
        }
      }
    }
    if(data.traineeIds.length<1){
      core.dialogUtil.showToast({title:'当前未选择成员'});
      return false;
    }
    core.dialogUtil.showModal({content:'确定添加成员吗？'},function() {
      core.request({
        url:"wx/classroom-trainee-api/importTraineeBatch?token="+core.globalData.userInfo.token,
        method: "POST",
        data:data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
          }
        }
      });
    },function() {});
  }

})