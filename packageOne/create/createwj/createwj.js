// packageOne/create/createwj/createwj.js
const app = getApp();
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataForm:{
      activityTitle:'',//活动主题
      activityId:'',//活动id
      purpose:'',//用途
      isShow:"Y",//投票后是否立即显示结果
      chapterId:'',//章节id
    },//表单数据项
    purposeName:'',//用途名称
    purposeList:[],//用途数组
    groupList:[],//分组列表
    pkgId:'',//教学包id
    funPurposeHidden: "true",//用途下拉选择是否显示
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
      if(name == 'purpose'){
        this.findDictName(this.data.purposeList,this.data.dataForm.purpose,'purposeName');
      }
    }else if(event.detail.type == 'cancel'){//点击取消

    }
  },
  /**添加用途 */
  toAddPurpose:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'radio';
    this.data.pickerDatas.titlePicker = '请选择用途';
    this.data.pickerDatas.listDataPicker = this.data.purposeList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.purpose)?( (this.data.dataForm.purpose).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'dictValue';
    this.data.pickerDatas.keyIdOfShowPicker = 'dictCode';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /** 投票后是否立即显示结果switch 的change事件 */
  switchChange:function(event){
    let value = event.detail.value
    if(value){
      this.data.dataForm.isShow = 'Y'
    }else{
      this.data.dataForm.isShow = 'N'
    }
    this.setData({
      ['dataForm.isShow']:this.data.dataForm.isShow
    })
  },
  /**input的实时输入事件 */
  bindinput:function(event){
    let name = event.currentTarget.dataset.name
    this.data.dataForm[name] = event.detail.value
    this.setData({
      ['dataForm.'+name]:this.data.dataForm[name]
    })
  },
  /**取消 */
  cancel:function(){
    wx.navigateBack();
  },
  /**获取 用途列表*/
  findPurposeList:function(){
    let that = this;
    core.request({
      url: "wx/activity-api/listActivityPurpose",
      method: "GET",
      success: function(res) {
        if (res.data.code === 0) {
          that.data.purposeList = []
          if(res.data.data && res.data.data.length>0){
            that.data.purposeList = res.data.data
            if(!that.data.dataForm.purpose){
              that.data.dataForm.purpose = res.data.data[0].dictCode
              that.setData({
                ['dataForm.purpose']:that.data.dataForm.purpose
              })
            }
            that.findDictName(that.data.purposeList,that.data.dataForm.purpose,'purposeName');
          }else{
            that.data.purposeList = [{dictCode:'',dictValue:'暂无数据'}]
          }
          that.setData({
            purposeList: that.data.purposeList
          })
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取pkgId的值
    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';
    this.data.dataForm.chapterId = (core.globalData.paramsData.chapterIdFromCha) ? (core.globalData.paramsData.chapterIdFromCha):'';
    this.data.onlyWatchActivityInfo = (core.globalData.paramsData.onlyWatchActivityInfo && core.globalData.paramsData.onlyWatchActivityInfo == 'true')?true:false;
    this.setData({
      pkgId:this.data.pkgId,
      ['dataForm.chapterId']:this.data.dataForm.chapterId,
      onlyWatchActivityInfo:this.data.onlyWatchActivityInfo
    })
    if(!core.stringUtil.objectIsNotNull(core.globalData.questionnaireData.firstData)){
      this.viewActivityInfo();
    }
    this.findPurposeList();
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
   /**编辑 活动 ，显示信息*/
   viewActivityInfo:function(){
     let that = this;
    if(core.stringUtil.objectIsNotNull(core.globalData.paramsData.currEditActivity)){
      let data = {
        activityId:core.globalData.paramsData.currEditActivity.activityId,
        activityType:core.globalData.paramsData.currEditActivity.activityType,
      }
      if(!data.activityId){
        return false;
      }
      if(that.data.onlyWatchActivityInfo){
        wx.setNavigationBarTitle({//动态设置当前页面的标题
          title: '查看投票/问卷'
        })
      }else{
        wx.setNavigationBarTitle({//动态设置当前页面的标题
          title: '编辑投票/问卷'
        })
      }
      core.request({
        url: "wx/activity-api/viewActivityInfo",
        method: "GET",
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            if(core.stringUtil.objectIsNotNull(res.data.data)){
              that.data.dataForm = Object.assign(that.data.dataForm,res.data.data);
              if(res.data.data.questionList && res.data.data.questionList.length>0){
                
                res.data.data.questionList.forEach((itemq,indexq) => {
                  if (itemq.questionType == '3') {
                    itemq.children = [];
                  }
                  if (!itemq.children || itemq.children.length < 1) { // 没有选项 则添加选项
                    itemq.children = [];
                    for(let a=0;a<4;a++){//optionName选项内容; String.fromCharCode((65 + a)) 65+0相当与A字母
                      itemq.children.push({optionId:'',optionCode: String.fromCharCode((65 + a)),optionName:'',isRight:'',canFill:'N'});
                    }
                  }
                });

                core.globalData.questionnaireData.secondData.result = res.data.data.questionList;
              }
              if(that.data.dataForm.questionList){
                delete that.data.dataForm.questionList;
              }
              that.setData({
                dataForm:that.data.dataForm
              })
              that.findDictName(that.data.purposeList,that.data.dataForm.purpose,'purposeName');
            }
          }
        }
      });
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
    //对设置的章节 返回的结果赋值
    if(core.stringUtil.objectIsNotNull(core.globalData.paramsData.setActivityChapterData) && (core.globalData.paramsData.setActivityChapterData.currActivityChapterId)){
      this.data.dataForm.chapterId = core.globalData.paramsData.setActivityChapterData.currActivityChapterId;
      this.setData({
        ['dataForm.chapterId']:this.data.dataForm.chapterId
      })
      core.globalData.questionnaireData.firstData.chapterId = this.data.dataForm.chapterId;
      core.globalData.paramsData.setActivityChapterData = {};
    }

    //跳转页面后返回获取dataForm的值后并清空
    if(core.stringUtil.objectIsNotNull(core.globalData.questionnaireData.firstData)){
      this.data.dataForm = Object.assign(this.data.dataForm,core.globalData.questionnaireData.firstData);
      this.setData({
        dataForm:this.data.dataForm
      })
      core.globalData.questionnaireData.firstData = {}
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

  /**去设置章节 */
  toSetChapter:function(){
    core.globalData.questionnaireData.firstData = Object.assign({},this.data.dataForm);
    wx.navigateTo({
      url: '/pages/classroom/resource/resource?sourseFrom='+'setActivityChapter'+'&currActivityChapterId='+this.data.dataForm.chapterId,// classroom  stuactivity
    })
  },

  //下一步跳转到编辑试题页面
  toAddQues: function (e) {
    if(!(core.stringUtil.trim(this.data.dataForm.activityTitle)) ){
      core.dialogUtil.showToast({title:'活动主题不能为空，请输入活动主题'})
      return false;
    }
    core.globalData.questionnaireData.firstData = Object.assign({},this.data.dataForm);
    wx.navigateTo({
      url: '/packageOne/create/addques/addques',
    })
  },
})