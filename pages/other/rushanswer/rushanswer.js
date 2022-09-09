// pages/other/rushanswer/rushanswer.js
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rushNum:0,//抢答人数
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
    ctId:'',//课堂id
    traineesList:[],// 确定好了的抢答人数数组
    rushedNumTwo:0,//学生点击抢答的人数
    scoreList:[],//评分列表数组
    stepState:'1',//未抢答
    currEditActivity:{},//上一个页面传递的当前活动的信息
    fromPages:'',//来自哪里， 'stuShowDetail'学生只可以看
  },
  /** 取消 已选择的学员 */
  toDel:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let that = this;
    core.dialogUtil.showModal({content:'确定取消选择该学员吗？'},function() {
      that.data.traineesList.splice(currIndex,1);
      that.data.rushedNumTwo = that.data.rushedNumTwo - 1;
      that.setData({
        traineesList:that.data.traineesList,
        rushedNumTwo:that.data.rushedNumTwo
      });
    },function(){});
  },
  /** 点击“完成”按钮 */
  toSave:function(){
    let that = this;
    if (!that.data.traineesList || (that.data.traineesList && that.data.traineesList.length<1)) {
      core.dialogUtil.showToast({title:'请选择学员'});
      return false;
    }
    core.dialogUtil.showModal({content:'确定保存吗？'},function() {
      let data = {
        ctId: that.data.ctId,
        activityId: that.data.currEditActivity.activityId,
        traineeScore:[],
      };
      if (that.data.traineesList && that.data.traineesList.length>0) {
        that.data.traineesList.forEach((item,index)=>{
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
  /** 查询 已经抢答了的学员  */
  querySuccessfulTraineeList:function(){
    let that = this;
    that.data.traineesList = [];
    that.setData({
      traineesList:that.data.traineesList
    });
    let data = {
      ctId: that.data.ctId,
      activityId: that.data.currEditActivity.activityId,
    };
    core.request({
      url: "wx/activity-api/performance/querySuccessfulTraineeList",
      method: "POST",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if(res.data.data && res.data.data.length>0){
            that.data.traineesList = [];
            let datas = res.data.data;
            datas.forEach((item,index)=>{
              item.score = '0';
              item.isChecked = false;
              item.traineePic = core.concatImgUrl(item.traineePic);
              // that.data.traineesList.pop(); // 删除数组最后一个元素
              if(that.data.traineesList && that.data.traineesList.length > 0){
                let traineesList = that.data.traineesList
                for(let i=(traineesList.length-1);i>=0;i--){
                  if(traineesList[i].traineeId == item.traineeId){
                    that.data.traineesList.splice(i,1);
                    break;
                  }
                }
              }
              that.data.traineesList.push(item);
            });
          }
          that.data.rushedNumTwo  = that.data.traineesList.length
          if(res.data.num && res.data.num > 0 &&  ( !that.data.traineesList || (that.data.traineesList && that.data.traineesList.length<1) ) ){
            
            for(let i=0;i < (res.data.num - that.data.traineesList.length) ;i++){
              that.data.traineesList.push({traineeName:'',traineePic:'',traineeId:'',score:''})
            }
          }
          that.setData({
            rushedNumTwo: that.data.rushedNumTwo,
            traineesList:that.data.traineesList
          });
        }
      }
    });
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
        if (this.data.traineesList && this.data.traineesList.length>0) {
          this.data.traineesList.forEach((item,index)=>{
            item.score = (event.detail.idList && event.detail.idList.length>0)?(event.detail.idList[0]):''
          })
          this.setData({
            traineesList: this.data.traineesList
          });
        }
      } else if (name && core.stringUtil.contains(name,'score_')) {
        let index = this.data.pickerDatas.namePicker.split('score_')[1];
        this.data.traineesList[index].score = (event.detail.idList && event.detail.idList.length>0)?(event.detail.idList[0]):'';
        this.setData({
          ['traineesList['+index+'].score']: this.data.traineesList[index].score
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
      this.data.pickerDatas.defaultDataPicker = (this.data.traineesList[index].score)?( (this.data.traineesList[index].score.toString()).split(',') ):'';
    }else if(this.data.pickerDatas.namePicker && this.data.pickerDatas.namePicker == 'scoreAll'){
      this.data.pickerDatas.defaultDataPicker = (this.data.traineesList[0].score)?( (this.data.traineesList[0].score.toString()).split(',') ):'';
    }
    this.data.pickerDatas.keyWordOfShowPicker = 'num';
    this.data.pickerDatas.keyIdOfShowPicker = 'num';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**取消按钮 */
  toBack:function(e){
    wx.navigateBack();
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

    this.data.rushNum = (this.data.currEditActivity && this.data.currEditActivity.answerNumber && this.data.currEditActivity.answerNumber > 0) ? (this.data.currEditActivity.answerNumber):0;

    this.data.traineesList = [];
    for(let i=0;i<this.data.rushNum;i++){
      this.data.traineesList.push({traineeName:'',traineePic:'',traineeId:'',score:''})
    }
    this.data.rushedNumTwo = 0;

    this.data.fromPages = (options && options.fromPages) ?(options.fromPages):'';

    this.setData({
      ctId:this.data.ctId,
      currEditActivity: this.data.currEditActivity,
      rushNum: this.data.rushNum,
      rushedNumTwo:this.data.rushedNumTwo,
      fromPages:this.data.fromPages,
      traineesList:this.data.traineesList
    });

    this.querySuccessfulTraineeList();
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