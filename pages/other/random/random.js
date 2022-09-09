// pages/other/random/random.js
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ctId:'',//课堂id
    manualStuList:[],//选取的学员列表
    sortObj:{},//随机出来的学员对象
    currEditActivity:{},//上一个页面传递的当前活动的信息
    count:0,//计数
    traineesList:[],//所有的学员
    randomState:'0',//随机选人状态：  0：原始，1：摇一摇手机 
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
    randomCenterIconAnimation:null,//摇一摇的动画对象
    setIntervalShake:null,//摇动 数组随机 定时器
    shakeInfo:{
      openFlag: false,//是否开启摇一摇
      times:-1,//摇动的次数
      lastTime:0,
      borderSpeed :800,//加速度 变化临界值
      x:0,y:0,z:0,
      lastX:0,lastY:0,lastZ:0,
    },
  },
  /** 取消 已选择的学员 */
  toDel:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let that = this;
    core.dialogUtil.showModal({content:'确定取消选择该学员吗？'},function() {
      that.data.manualStuList[currIndex].score = '0';
      that.data.traineesList.push(that.data.manualStuList[currIndex]);
      that.data.manualStuList.splice(currIndex,1);
      that.setData({
        traineesList:that.data.traineesList,
        manualStuList:that.data.manualStuList
      });
    },function(){});
  },
  /** 点击“完成”按钮 */
  toSave:function(){
    let that = this;
    if (!that.data.manualStuList || (that.data.manualStuList && that.data.manualStuList.length<1)) {
      core.dialogUtil.showToast({title:'请选择学员'});
      return false;
    }
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
  /** 获取所有学员列表 数据 */
  getTraineesList:function(){
    let that = this;
    that.data.traineesList = [];
    that.data.manualStuList = [];
    that.setData({
      traineesList:that.data.traineesList,
      manualStuList:that.data.manualStuList
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
    let that = this;
    // 创建动画实例
    this.data.randomCenterIconAnimation = wx.createAnimation({
      delay: 0,//动画延迟时间
      duration:100,//动画持续时间 ms
      timingFunction:'linear',//动画效果
      transformOrigin:'center bottom',
      success:function(res){
      }
    })
    this.setData({
      randomCenterIconAnimation: this.data.randomCenterIconAnimation
    })
    //开始监听加速度数据
    wx.startAccelerometer({
      interval: 'ui',
      fail:function(err){
        core.dialogUtil.showToast({title:'您的设备不支持摇一摇哦！'});
      }
    });
    //监听加速度数据事件。频率根据 wx.startAccelerometer() 的 interval 参数, 接口调用后会自动开始监听
    wx.onAccelerometerChange(function (event) {
      that.handleAccelerometerChange(event);
    });
  },
  /** 开始动画并且选人 */
  shakeAnimStart:function(){
    let that = this;
    if (that.data.traineesList && that.data.traineesList.length > 0) {
      wx.vibrateLong(); //手机震动
      this.data.setIntervalShake = setInterval(function(){
        that.data.randomState = '1';
        let sortList = that.data.traineesList.sort(function(a,b){
          let result =  0.5 - Math.random()
          return result;
        })
        that.data.sortObj = sortList.slice(0,1)[0];
        that.setData({
          randomState:that.data.randomState,
          sortObj:that.data.sortObj
        });
      },100);
      setTimeout(function(){
        that.clearTimeInterval()
      },400)
      this.setData({
        setIntervalShake:this.data.setIntervalShake
      });
    }
  },
  /**清除 时间 的定时器  */
  clearTimeInterval:function() {
    clearInterval(this.data.setIntervalShake);
    this.data.setIntervalShake = null;
    this.data.randomState = '0';
    this.setData({
      setIntervalShake:this.data.setIntervalShake,
      randomState:this.data.randomState
    })
    if (this.data.sortObj && core.stringUtil.objectIsNotNull(this.data.sortObj) && this.data.traineesList && this.data.traineesList.length > 0) {
      this.data.manualStuList.push(this.data.sortObj);
      if(this.data.traineesList && this.data.traineesList.length>0){
        let traineesList = this.data.traineesList;
        for(let i= (traineesList.length-1);i>=0;i--){
          if(traineesList[i].traineeId == this.data.sortObj.traineeId){
            traineesList.splice(i,1);
          }
        }
      }
      this.data.sortObj = {};
      this.setData({
        traineesList:this.data.traineesList,
        manualStuList: this.data.manualStuList,
        sortObj: this.data.sortObj
      })
    }
  },
  /** 处理  监听加速度数据事件 返回的数据*/
  handleAccelerometerChange:function(event){
    let that = this;
    if (event.x > .5 && event.y > .5) {
      that.data.count =  that.data.count + 1;
      that.setData({
        count : that.data.count
      });
      if(that.data.count%2 == 0)  {
        setTimeout(function(){
        if (that.data.sortObj && core.stringUtil.objectIsNotNull(that.data.sortObj) && that.data.traineesList && that.data.traineesList.length > 0) {
        } else{
          that.shakeAnimStart();
        }
          // that.clearTimeInterval()
        },400)
        // 发送socket连接 
      }
    }

    that.data.shakeInfo.x = event.x;
    that.data.shakeInfo.y = event.y;
    if(  Math.abs(that.data.shakeInfo.x) -  Math.abs(that.data.shakeInfo.lastX) <0.02 || Math.abs(that.data.shakeInfo.y) -  Math.abs(that.data.shakeInfo.lastY) <0.02  ){
      // that.clearTimeInterval()
    }else{
      // that.data.randomState = '1';
    }
    that.data.shakeInfo.lastX = that.data.shakeInfo.x;
    that.data.shakeInfo.lastY = that.data.shakeInfo.y;
    that.setData({
      shakeInfo: that.data.shakeInfo
    });

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.clearTimeInterval();
    //停止监听加速度数据 
    wx.stopAccelerometer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearTimeInterval();
    //停止监听加速度数据 
    wx.stopAccelerometer();
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