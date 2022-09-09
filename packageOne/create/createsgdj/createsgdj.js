// packageOne/create/createsgdj/createsgdj.js
const app = getApp();
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    traineeList:[],//班级学员分组列表
    traineeName:'',//搜索内容
    typeSheetHidden:true,//类型是否隐藏
    ctId:'',//课堂id
    activityId:'',//活动id
    pkgId:'',//教学包id
    signTypeList:[],//设置的type类型列表
    isShowDetail:false,//是否是详情页
    noDataSgqIsShow:false,//暂无数据是否显示
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
  },
  /**取消 */
  cancel:function(){
    wx.navigateBack();
  },
  /**显示or隐藏 类型 设置 */
  typeClassTap:function(event){
    let type = event.currentTarget.dataset.type
    if(type == 'show'){
      this.data.typeSheetHidden = false;
    }else if(type == 'cancel'){
      this.data.typeSheetHidden = true;
    }
    this.setData({
      typeSheetHidden:this.data.typeSheetHidden
    })
  },
  /**设置学员的 签到状态 */
  setTraineeSignState:function(event){
    this.data.typeSheetHidden = true;
    this.setData({
      typeSheetHidden:this.data.typeSheetHidden
    })
    let that = this;
    let data = {
      pkgId:this.data.pkgId,
      ctId:this.data.ctId,
      activityId:this.data.activityId,
      signType:'3',
      signState:event.currentTarget.dataset.state,
    };
    data.traineeIds = [];
    if(this.data.traineeList && this.data.traineeList.length>0){
      let traineeList = this.data.traineeList;
      for(let a=0;a<traineeList.length;a++){
        if(traineeList[a].children && traineeList[a].children.length>0){
          let children = traineeList[a].children;
          for(let a2=0;a2<children.length;a2++){
            if(children[a2].isChecked){
              data.traineeIds.push(children[a2].traineeId);
            }
          }
        }
      }
    }
    //对提交的数据进行验证
    if(!data.traineeIds || ( (data.traineeIds) && data.traineeIds.length<1 )){
      core.dialogUtil.showToast({title:'请选择成员'})
      return false;
    }
    core.dialogUtil.showModal({content:'确定提交吗？'},function() {
      core.request({
        url: "wx/activity-api/signin/setTraineeSignState?token="+core.globalData.userInfo.token+'&pkgId='+that.data.pkgId,
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            that.listClassTrainee();
          }
        }
      });
    },function() {});
  },
  /**全选或者取消 */
  allCancel: function (event) {
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.traineeList[currIndex].isChecked = !(this.data.traineeList[currIndex].isChecked);
    if(this.data.traineeList[currIndex].children && this.data.traineeList[currIndex].children.length>0){
      let children = this.data.traineeList[currIndex].children;
      for(let a=0;a<children.length;a++){
        children[a].isChecked = this.data.traineeList[currIndex].isChecked;
      }
    }
    this.setData({
      ['traineeList['+currIndex+']']:this.data.traineeList[currIndex]
    })
  },
  /**获取未加入课堂的学员列表信息 */
  listClassTrainee:function(){
    let that = this;
    that.data.noDataSgqIsShow = false;
    that.setData({
      noDataSgqIsShow:that.data.noDataSgqIsShow
    });
    let data = {
      traineeName:this.data.traineeName,
      ctId:this.data.ctId,
      activityId:this.data.activityId,
    };
    core.request({
      url:"wx/activity-api/signin/queryTraineeList",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          that.data.traineeList = [];
          if(res.data.data && res.data.data.length>0){
            let ss =  res.data.data;
            for(let a0=0;a0<ss.length;a0++){
              ss[a0].isChecked = false;
              if(ss[a0].children && ss[a0].children.length>0){
                for(let a=0;a<ss[a0].children.length;a++){
                  ss[a0].children[a].traineePic = core.concatImgUrl(ss[a0].children[a].traineePic);
                  ss[a0].children[a].createTime = core.dateUtil.getMsgTime(ss[a0].children[a].createTime);
                  ss[a0].children[a].isChecked = false;
                }
              }
            }
            
            that.data.traineeList = ss;
          }
          that.setData({
            traineeList:that.data.traineeList
          });
        }
        if (!that.data.traineeList || ( that.data.traineeList && that.data.traineeList.length < 1)) {
          that.data.noDataSgqIsShow = true;
          that.setData({
            noDataSgqIsShow:that.data.noDataSgqIsShow
          });
        }
      },
      fail:function(){
        if (!that.data.traineeList || ( that.data.traineeList && that.data.traineeList.length < 1)) {
          that.data.noDataSgqIsShow = true;
          that.setData({
            noDataSgqIsShow:that.data.noDataSgqIsShow
          });
        }
      }
    });
  },
  /**输入框模糊查询 */
  bindinput:function(event){
    this.data.traineeName = event.detail.value;
    this.setData({
      traineeName:this.data.traineeName
    })
    // this.listClassTrainee();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';
    //获取pkgId的值
    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';
    this.data.isShowDetail = (options && options.type && options.type == 'showdetail')?true:false;
    this.data.activityId = (options && options.activityId)?(options.activityId):'';
    this.setData({
      ctId:this.data.ctId,
      pkgId:this.data.pkgId,
      isShowDetail:this.data.isShowDetail,
      activityId:this.data.activityId
    })
    let title = '签到';
    if(this.data.isShowDetail){
      title = '查看签到情况';
    }
    wx.setNavigationBarTitle({//动态设置当前页面的标题
      title: title
    })
    this.listClassTrainee();
    this.findSignTypeList();
  },
  /**获取设置 的 类型列表 */
  findSignTypeList:function(){
    let that = this;
    core.request({
      url:'wx/activity-api/signin/getDictList',
      method:'GET',
      success:function(suc){
        if(suc.data.code == 0){
          that.data.signTypeList = [];
          if(suc.data.data && suc.data.data.length>0){
            that.data.signTypeList = suc.data.data;
          }else{
            that.data.signTypeList.push({
              dictValue:'暂无数据',
              dictCode:''
            })
          }
          that.setData({
            signTypeList:that.data.signTypeList
          });
        }
      },
    });
  },
  /**搜索 */
  searchInput:function(){
    this.listClassTrainee();
  },
  /**勾选 成员 */
  checkboxChange:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    if(this.data.traineeList[currIndex].children && this.data.traineeList[currIndex].children.length>0){
      let children = this.data.traineeList[currIndex].children;
      for(let a=0;a<children.length;a++){
        children[a].isChecked = false;
      }
    }

    let valueList = event.detail.value;
    if(valueList && valueList.length>0){
      for(let a1=0;a1<valueList.length;a1++){
        this.data.traineeList[currIndex].children[valueList[a1]].isChecked = true;
      }
    }
    
    this.data.traineeList[currIndex].isChecked = false;
    if( (valueList) && (valueList.length>0) && (valueList.length == this.data.traineeList[currIndex].children.length)){
      this.data.traineeList[currIndex].isChecked = true;
    }
    this.setData({
      ['traineeList['+currIndex+']']:this.data.traineeList[currIndex]
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