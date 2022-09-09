// packageOne/me/peredit/peredit.js
const core = require("../../../utils/core/core.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    myInfo:{
      basicInfo:{}
    },//个人信息
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
    identityList:[],// 身份 列表
    identityIndex:0,// 当前被选中的 身份列表 的下标
    sexList:[],// 性别 列表
    sexIndex:0,// 当前被选中的 性别列表 的下标
    isTeacher:false,//是否是老师
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    traineeId:'',//学员 id
    isChangeImg:false,//是否更改了头像
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
      if(name == 'sex'){
        this.data.myInfo.basicInfo.traineeSex = (event.detail.idList && event.detail.idList.length>0)?( (name == 'class')?(event.detail.idList.join(',')):(event.detail.idList[0]) ):''; 
        this.setData({
          ['myInfo.basicInfo.traineeSex']:this.data.myInfo.basicInfo.traineeSex
        })
      }else{
        this.data.myInfo.basicInfo[name+'Id'] = (event.detail.idList && event.detail.idList.length>0)?( (name == 'class')?(event.detail.idList.join(',')):(event.detail.idList[0]) ):''; 
        this.setData({
          ['myInfo.basicInfo.'+name+'Id']:this.data.myInfo.basicInfo[name+'Id']
        })
      }
      this.data[name+'Index'] = (event.detail.indexList)?( event.detail.indexList ):[]; 
      this.setData({
        [name+'Index']:this.data[name+'Index']
      })
      
    }else if(event.detail.type == 'cancel'){//点击取消

    }
  },
  /**添加 性别 类型 */
  toAddSex:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择性别';
    this.data.pickerDatas.listDataPicker = this.data.sexList;
    this.data.pickerDatas.defaultDataPicker = (this.data.myInfo.basicInfo.traineeSex)?( (this.data.myInfo.basicInfo.traineeSex).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'dictValue';
    this.data.pickerDatas.keyIdOfShowPicker = 'dictCode';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**获取 性别 列表 */
  findListSexList:function(){
    let that = this;
    core.request({
      url: "wx/api/trainee/listSex",
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.data.sexList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.myInfo.basicInfo && that.data.myInfo.basicInfo.traineeSex) && ( res.data.data[i].dictCode == that.data.myInfo.basicInfo.traineeSex )){
                that.data.sexIndex = i;
                break;
              }
            }
            that.data.sexList = res.data.data;
            if(!that.data.myInfo.basicInfo || !that.data.myInfo.basicInfo.traineeSex){
              that.data.myInfo.basicInfo.traineeSex = that.data.sexList[0].dictCode;
              that.data.sexIndex = 0;
            }
          }
          that.setData({
            sexList: that.data.sexList,
            ['myInfo.basicInfo.traineeSex']: that.data.myInfo.basicInfo.traineeSex,
            sexIndex: that.data.sexIndex
          })
        }
      }
    });
  },
  /**获取 身份 列表 */
  findListIdentityList:function(){
    let that = this;
    core.request({
      url: "wx/api/trainee/listIdentity",
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.data.identityList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.myInfo.basicInfo && that.data.myInfo.basicInfo.traineeType) && ( res.data.data[i].dictCode == that.data.myInfo.basicInfo.traineeType )){
                that.data.identityIndex = i;
                break;
              }
            }
            that.data.identityList = res.data.data;
            if(!that.data.myInfo.basicInfo || !that.data.myInfo.basicInfo.traineeType){
              that.data.myInfo.basicInfo.traineeType = that.data.identityList[0].dictCode;
              that.data.identityIndex = 0;
            }
          }
          that.setData({
            identityList: that.data.identityList,
            ['myInfo.basicInfo.traineeType']: that.data.myInfo.basicInfo.traineeType,
            identityIndex: that.data.identityIndex
          })
        }
      }
    });
  },
  /**选择头像 */
  chooseImg:function(){
    let that = this;
    core.chooseImage({
      count:1,
      success(res){
        that.data.isChangeImg = true;
        that.setData({
          isChangeImg:that.data.isChangeImg
        });
        that.data.myInfo.basicInfo.traineePic = res.tempFilePaths[0];
        that.setData({
          ['myInfo.basicInfo.traineePic']: that.data.myInfo.basicInfo.traineePic
        })
      }
    })
  },
  /**保存 */
  save:function(){
    let that = this;
    let url = "wx/api/trainee/saveInfo";
    let data = {};
    url = "wx/classroom-trainee-api/updateTraineeInfo";
    data = {
      ctId:(core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'',
      traineeName:this.data.myInfo.basicInfo.traineeName,//姓名
      nickName:this.data.myInfo.basicInfo.nickName,//昵称
      traineeId:this.data.myInfo.basicInfo.traineeId,//id
      traineeSex : this.data.myInfo.basicInfo.traineeSex, //性别
      file: this.data.myInfo.basicInfo.traineePic,
    }
    if(!(core.stringUtil.trim(data.traineeName)) ){
      core.dialogUtil.showToast({title:'姓名不能为空，请输入姓名'})
      return false;
    }
    if(!(core.stringUtil.trim(data.nickName)) ){
      core.dialogUtil.showToast({title:'昵称不能为空，请输入昵称'})
      return false;
    }
    core.dialogUtil.showModal({content:'确定保存吗？'},function() {
      if(that.data.isChangeImg ){
        core.uploadFile({
          url: "wx/classroom-trainee-api/updateTraineeInfo",
          filePath: data.file,
          formData:data,
          name:'file',
          success: function(res1) {
            let res = ( (res1.data) && (typeof (res1.data) == 'string') && (!core.stringUtil.startWith(res1.data,'<')) ) ? (JSON.parse(res1.data)) :(res1.data);
            if(res.code == 0){
              if(res.msg){
                core.dialogUtil.showToast({title:res.msg});
              }
              core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
            }
          }
        });
      }else{
        core.request({
          url: "wx/classroom-trainee-api/updateTraineeInfoNoFile",
          method:'POST',
          data:data,
          success: function(res) {
            if(res.data.code == 0){
              if(res.data.msg){
                core.dialogUtil.showToast({title:res.data.msg});
              }
              core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
            }
          }
        });
      }
    },function() {});
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.traineeId = (options && options.traineeId)?(options.traineeId):'';
    this.data.isChangeImg = false;
    this.setData({
      traineeId:this.data.traineeId,
      isChangeImg:this.data.isChangeImg
    });

    let that = this;
    let data = {
      ctId:(core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'',
      traineeId:this.data.traineeId,
    };
    wx.setNavigationBarTitle({//动态设置当前页面的标题
      title: '编辑学员信息'
    })
    core.request({
      url: "wx/classroom-trainee-api/viewTraineeBaseInfo",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          let suc = res.data;
          if( suc.data){
            that.data.myInfo = suc.data;
            that.data.myInfo.basicInfo = that.data.myInfo.baseInfo;
            that.data.isTeacher = false;
            that.data.myInfo.basicInfo.traineePic = core.concatImgUrl(that.data.myInfo.basicInfo.traineePic);
            that.setData({
              myInfo:that.data.myInfo,
              isTeacher:that.data.isTeacher
            });
            that.findListSexList();
          }
        }
      }
    });
   
  },
  /**监听 输入框 的实时输入事件 */
  bindinput:function(event){
    let name = event.currentTarget.dataset.name
    this.data.myInfo.basicInfo[name] = event.detail.value
    this.setData({
      ['myInfo.basicInfo.'+name]:this.data.myInfo.basicInfo[name]
    })
  },
  /**取消 */
  cancel:function(){
    wx.navigateBack();
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