// pages/other/manual/manual.js
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ctId:'',//课堂id
    traineesList:[],///所有学员列表
    manualStuList:[],//选取的学员列表
    stepState:'0',//未抢答
    scoreList:[],//评分列表数组
    pickerDatas:{
      namePicker:'',//data-name的值，用于区分各个picker
      isShowPicker:false,//组件是否显示
      typePicker:'radio',//类型
      titlePicker:'',//标题
      listDataPicker:[],//列表数据
      defaultDataPicker:[],// 默认选择的 列表数据的 id 组合
      keyWordOfShowPicker:'',// picker的 数组 中 要展示的文字的 关键字
      keyIdOfShowPicker:'',// picker的 数组 中 要获取的id的 name
    },//picker组件相关信息 
    currEditActivity:{},//上一个页面传递的当前活动的信息
  },
  /** 取消 已选择的学员 */
  toDel:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let that = this;
    core.dialogUtil.showModal({content:'确定取消选择该学员吗？'},function() {
      that.data.manualStuList.splice(currIndex,1);
      that.setData({
        manualStuList:that.data.manualStuList
      });
    },function(){});
  },
  /** 点击“完成”按钮 */
  toSave:function(){
    let that = this;
    core.dialogUtil.showModal({content:'确定保存吗？'},function() {
      let data = {
        ctId: that.data.ctId,
        activityId: that.data.currEditActivity.activityId,
        traineeScore:[],
      };
      if (that.data.manualStuList && that.data.manualStuList.length>0) {
        that.data.manualStuList.forEach((item,index)=>{
          data.traineeScore.push({traineeId:item.traineeId, score:item.score});
        });
      }
      core.request({
        url: "wx/activity-api/performance/giveScore",
        method: "POST",
        data: data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          if (res.data.code === 0) {
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
          }
        }
      });
    },function() {});
  },
  /**picker 点击 按钮 返回的事件 */
  pickerClose:function(event){
    this.data.pickerDatas.isShowPicker = false;
    this.setData({
      ['pickerDatas.isShowPicker']:this.data.pickerDatas.isShowPicker
    })
    if(event.detail.type == 'confirm'){//点击确定
      let name = this.data.pickerDatas.namePicker;
      //如果是添加班级，则是 (event.detail.idList.join(',')用逗号连起来，否则(event.detail.idList[0])直接取第一个
      if (name == 'scoreAll') {
        if (this.data.manualStuList && this.data.manualStuList.length>0) {
          this.data.manualStuList.forEach((item,index)=>{
            item.score = (event.detail.idList && event.detail.idList.length>0)?(event.detail.idList[0]):''
          })
          this.setData({
            manualStuList: this.data.manualStuList
          });
        }
      } else if (name && core.stringUtil.contains(name,'score_')) {
        let index = this.data.pickerDatas.namePicker.split('score_')[1];
        this.data.manualStuList[index].score = (event.detail.idList && event.detail.idList.length>0)?(event.detail.idList[0]):'';
        this.setData({
          ['manualStuList['+index+'].score']: this.data.manualStuList[index].score
        });
      }
      
    }else if(event.detail.type == 'cancel'){//点击取消

    }
  },
  /** 显示评分下拉框 */
  toAddScore:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择分数';
    this.data.pickerDatas.listDataPicker = this.data.scoreList;
    if(this.data.pickerDatas.namePicker && core.stringUtil.contains(this.data.pickerDatas.namePicker,'score_')){
      let index = this.data.pickerDatas.namePicker.split('score_')[1];
      this.data.pickerDatas.defaultDataPicker = (this.data.manualStuList[index].score)?( (this.data.manualStuList[index].score.toString()).split(',') ):'';
    }else if(this.data.pickerDatas.namePicker && this.data.pickerDatas.namePicker == 'scoreAll'){
      this.data.pickerDatas.defaultDataPicker = (this.data.manualStuList[0] && this.data.manualStuList[0].score)?( (this.data.manualStuList[0].score.toString()).split(',') ):'';
    }
    this.data.pickerDatas.keyWordOfShowPicker = 'num';
    this.data.pickerDatas.keyIdOfShowPicker = 'num';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /** 改变当前是第几步 ，进入下一步 */
  stepStateChange:function(event){
    this.data.stepState = event.currentTarget.dataset.num;
    if(this.data.stepState == '1'){
      if(!this.data.manualStuList || (this.data.manualStuList && this.data.manualStuList.length<1)){
        core.dialogUtil.showToast({title:'请选取学员参与活动'});
        return false;
      }
    }
    this.setData({
      stepState:this.data.stepState
    });
  },
  /** 复选框 点击事件 */
  toCheckBox:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.traineesList[currIndex].isChecked = !(this.data.traineesList[currIndex].isChecked);
    this.data.manualStuList = [];
    this.data.traineesList.forEach((item,index)=>{
      if (item.isChecked){
        this.data.manualStuList.push(item);
      }
    })
    this.setData({
      ['traineesList['+currIndex+'].isChecked']:this.data.traineesList[currIndex].isChecked,
      manualStuList:this.data.manualStuList
    });
  },
  /** 获取所有学员列表 数据 */
  getTraineesList:function(){
    let that = this;
    that.data.traineesList = [];
    that.setData({
      traineesList:that.data.traineesList
    });
    let data = {
      ctId: that.data.ctId,
    };
    core.request({
      url: "wx/activity-api/performance/selectClassroomTraineeList",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if(res.data.data && res.data.data.length>0){
            that.data.traineesList = res.data.data;
            that.data.traineesList.forEach((item,index)=>{
              item.score = '0';
              item.isChecked = false;
              item.traineePic = core.concatImgUrl(item.traineePic);
            });
            that.setData({
              traineesList:that.data.traineesList
            });
          }
        }
      }
    });
  },
  /** 获取评分的分数数组 */
  getscoreList:function(){
    this.data.scoreList = [];
    for(let i=0;i<=10;i++){
      this.data.scoreList.push({num:i})
    }
    this.setData({
      scoreList:this.data.scoreList
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';
    this.data.currEditActivity = ( options && options.currEditActivity && core.stringUtil.objectIsNotNull(JSON.parse(options.currEditActivity)))?(JSON.parse(options.currEditActivity)): ( (core.globalData.paramsData.currEditActivity && core.stringUtil.objectIsNotNull(core.globalData.paramsData.currEditActivity) ) ? (core.globalData.paramsData.currEditActivity):{} );
    this.setData({
      ctId:this.data.ctId,
      currEditActivity: this.data.currEditActivity
    })
    this.getTraineesList();
    this.getscoreList();
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