// packageOne/create/createktbx/createktbx.js

const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataForm:{
      activityTitle:'',//活动主题
      activityId:'',//活动id
      type:'1', //活动类型
      answerNum:1,//抢答人数
    },//表单数据项
    typeName:'',//活动类型 名称
    typeList:[],//活动类型 数组
    groupList:[],//分组列表
    pkgId:'',//教学包id
    ctId:'',//课堂id
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
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    onlyWatchActivityInfo:false,//是否查看信息
    answerNumMax:0,//抢答的最大人数
  },
  /**获取已加入学员列表数据 */
  findMemberList:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      pageNum: 1,
      pageSize: 1,
      traineeName:''
    };
    core.request({
      url: "wx/classroom-trainee-api/listClassroomTrainee",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if(res.data.data && res.data.data.totalPage){
            that.data.answerNumMax = res.data.data.totalPage
            that.setData({
              answerNumMax:that.data.answerNumMax
            })
          }
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
      this.data.dataForm[name] = (event.detail.idList && event.detail.idList.length>0)?((event.detail.idList[0]) ):'';
      this.setData({
        ['dataForm.'+name]:this.data.dataForm[name]
      })
      if(name == 'type'){
        this.findDictName(this.data.typeList,this.data.dataForm.type,'typeName');
      }
    }else if(event.detail.type == 'cancel'){//点击取消

    }
  },
  /**添加用途 */
  toAddType:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'radio';
    this.data.pickerDatas.titlePicker = '请选择活动类型';
    this.data.pickerDatas.listDataPicker = this.data.typeList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.type)?( (this.data.dataForm.type).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'dictValue';
    this.data.pickerDatas.keyIdOfShowPicker = 'dictCode';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**获取 活动类型 列表*/
  findTypeList:function(){
    let that = this;
    that.data.typeList = [];
    let datas = [
      {dictCode:'1',dictValue:'抢答'},
      {dictCode:'2',dictValue:'随机选人'},
      {dictCode:'3',dictValue:'手动选人'},
      // {dictCode:'4',dictValue:'小组评价'}
    ]
    if(datas && datas.length>0){
      that.data.typeList = datas
      if(!that.data.dataForm.type){
        that.data.dataForm.type = res.data.data[0].dictCode
        that.setData({
          ['dataForm.type']:that.data.dataForm.type
        })
      }
      that.findDictName(that.data.typeList,that.data.dataForm.type,'typeName');
    }else{
      that.data.typeList = [{dictCode:'',dictValue:'暂无数据'}]
    }
    that.setData({
      typeList: that.data.typeList
    })
  },
  /**保存 */
  save:function(){
    let that = this;
    if(!(core.stringUtil.trim(this.data.dataForm.activityTitle)) ){
      core.dialogUtil.showToast({title:'活动主题不能为空，请输入活动主题'})
      return false;
    }
    if(!(core.stringUtil.trim(this.data.dataForm.type)) ){
      core.dialogUtil.showToast({title:'活动类型不能为空，请选择活动类型'})
      return false;
    }
    if(this.data.dataForm.type  && this.data.dataForm.type =='1'){
      if(!this.data.dataForm.answerNum || !(core.stringUtil.trim(this.data.dataForm.answerNum.toString() )) ){
        core.dialogUtil.showToast({title:'抢答人数不能为空，请输入抢答人数'})
        return false;
      }
      if(parseInt(that.data.answerNumMax) < 1){
        core.dialogUtil.showToast({title:'当前课堂暂无学员，请添加成员'})
        return false;
      }
      if(parseInt(this.data.dataForm.answerNum) > parseInt(that.data.answerNumMax)){
        core.dialogUtil.showToast({title:'抢答人数不能大于'+that.data.answerNumMax+'，请输入抢答人数'})
        return false;
      }
      
    }
    let data = {
      pkgId:this.data.pkgId,
      ctId: this.data.ctId,
      type: this.data.dataForm.type , //1 抢答、2 随机选人、3 手动选人
      answerTitle: this.data.dataForm.activityTitle , //活动标题
    };
    if(data.type  && data.type =='1'){
      data.answerNum = this.data.dataForm.answerNum; //抢答人数
    }
    core.dialogUtil.showModal({content:'确定保存吗？'},function() {
      core.request({
        url: "wx/activity-api/performance/launchAnswer",
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            core.globalData.paramsData.activityIndex = 1;
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
          }
        }
      });
    },function() {});
    
  },
  /**取消 */
  cancel:function(){
    wx.navigateBack();
  },
  /**input的实时输入事件 */
  bindinput:function(event){
    let name = event.currentTarget.dataset.name
    this.data.dataForm[name] = event.detail.value
    this.setData({
      ['dataForm.'+name]:this.data.dataForm[name]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取pkgId的值
    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.onlyWatchActivityInfo = (core.globalData.paramsData.onlyWatchActivityInfo && core.globalData.paramsData.onlyWatchActivityInfo == 'true')?true:false;
    this.setData({
      pkgId:this.data.pkgId,
      ctId: this.data.ctId,
      onlyWatchActivityInfo:this.data.onlyWatchActivityInfo
    })
    this.findTypeList();
    this.findMemberList();
  },
  /**根据 dictCode 循环找到 dictValue*/
  findDictName:function(arr,dictCode,name){
    if(arr && arr.length>0){
      for(let i=0;i<arr.length;i++){
        if(arr[i].dictCode == dictCode){
          this.setData({
            [name]:arr[i].dictValue
          })
          break;
        }
      }
    }
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
    //跳转页面后返回获取dataForm的值后并清空
    if(core.stringUtil.objectIsNotNull(core.globalData.classroomPerformanceData)){
      this.data.dataForm = Object.assign(this.data.dataForm,core.globalData.classroomPerformanceData);
      this.setData({
        dataForm:this.data.dataForm
      })
      core.globalData.classroomPerformanceData = {}
    }
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

  },



})