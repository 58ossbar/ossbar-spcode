// packageOne/create/addques/addques.js
const app = getApp();
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pkgId:'',//教学包id
    result:[],//题目数组
    currTmIndex:0,//当前是第几道题目
    questionTypeList:[],//题目类型数组
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    onlyWatchActivityInfo:false,//是否查看信息
  },
  /** 设置 选中  就 可以 填写  */
  checkboxCodeChange:function(event){
    let children = this.data.result[this.data.currTmIndex].children;
    let currIndex =  event.currentTarget.dataset.currindex;
    children[currIndex].canFill = (children[currIndex].canFill && children[currIndex].canFill == 'Y')?'N':'Y';
    this.setData({
      ['result['+this.data.currTmIndex+'].children['+currIndex+'].canFill']:children[currIndex].canFill
    })
  },
  /**删除选项 */
  toDelOption:function(event){
    let children = this.data.result[this.data.currTmIndex].children;
    let currIndex =  event.currentTarget.dataset.currindex;
    if(children && children.length <= 3){
      core.dialogUtil.showToast({title:'至少需要3个选项'});
      return false;
    }
    //删除当前题目
    children.splice(currIndex,1);
    //重排序号
    if(children && children.length>0){
      for(let a=0;a<children.length;a++){
        children[a].optionCode = String.fromCharCode((65 + a));
      }
    }
    this.setData({
      ['result['+this.data.currTmIndex+'].children']:children
    })
  },
  /**添加选项 */
  toAddOption:function(){
    let children = this.data.result[this.data.currTmIndex].children;
    if(children && children.length >= 6){
      core.dialogUtil.showToast({title:'暂不得超过6个选项'});
      return false;
    }
    //String.fromCharCode((65 + a)) 65+0相当与A字母
    children.push({optionId:'',optionCode: String.fromCharCode((65 + (children.length))),optionName:'',isRight:'', canFill: 'N'});
    let lastIndex = children.length-1
    this.setData({
      ['result['+this.data.currTmIndex+'].children['+lastIndex+']']:children[lastIndex]
    })
  },
  /**选项的实时输入事件 */
  optionInput:function(event){
    let children = this.data.result[this.data.currTmIndex].children;
    let currIndex =  event.currentTarget.dataset.currindex;
    children[currIndex].optionName = event.detail.value
    this.setData({
      ['result['+this.data.currTmIndex+'].children['+currIndex+'].optionName']:children[currIndex].optionName
    })
  },
  /**删除当前题目 */
  toDelCurrTm:function(){
    let that = this;
    if(!that.data.result[that.data.currTmIndex].questionName){
      core.dialogUtil.showToast({title:'当前题目未填写，不可删除'});
      return false;
    }
    core.dialogUtil.showModal({content:'确定删除当前题目吗？'},function() {
      let currTmIndex = that.data.currTmIndex ;
      let allNum = that.data.result.length -1; 
      //如果是最后一题，则当前题目序号-1   
      if((currTmIndex == allNum) && (currTmIndex != 0)){
        that.data.currTmIndex = currTmIndex -1
        that.setData({
          currTmIndex:that.data.currTmIndex
        })
      }
      //删除当前题目
      that.data.result.splice(currTmIndex,1);
      that.setData({
        result:that.data.result
      })
      //如果是第一题并且只有一个题目则重置题目
      if(currTmIndex == 0 && that.data.result && that.data.result.length<1){
        that.initAddNewTm();
      }
    },function() {});
  },
  /**题目类型的change事件 */
  radioChange:function(event){
    this.data.result[this.data.currTmIndex].questionType = event.detail.value;
    if(this.data.result[this.data.currTmIndex].questionType == '3'){
      this.data.result[this.data.currTmIndex].tips = '';//简答题的提示语
    }
    this.setData({
      ['result['+this.data.currTmIndex+'].questionType']:this.data.result[this.data.currTmIndex].questionType,
      ['result['+this.data.currTmIndex+'].tips']:this.data.result[this.data.currTmIndex].tips
    })
  },
  /**题干的实时输入 事件 */
  textareaInput:function(event){
    let name = event.currentTarget.dataset.name;
    this.data.result[this.data.currTmIndex][name] = event.detail.value;
    this.setData({
      ['result['+this.data.currTmIndex+'].'+name]:this.data.result[this.data.currTmIndex][name]
    })
  },
  /**获取  题目类型数组 数据*/
  findQuestionTypeList:function(){
    let that = this;
    core.request({
      url: "wx/activity-api/voteQuestionnaire/listQuestionType",
      method: "GET",
      success: function(res) {
        if (res.data.code === 0) {
          let ss = []
          if(res.data.data && res.data.data.length>0){
            ss = res.data.data
          }
          that.data.questionTypeList = ss
          that.setData({
            questionTypeList: that.data.questionTypeList
          })
          if((!that.data.result) || ( (that.data.result && that.data.result.length<1)  ) ){
            that.initAddNewTm();
          }
        }
      }
    });
  },
  /**切换题目 */
  toTabTm:function(event){
    this.data.currTmIndex = event.currentTarget.dataset.currindex;
    this.setData({
      currTmIndex:this.data.currTmIndex
    })
  },
  /**已有题目，判断是否填写完整 */
  checkTm:function(){
    let isSuc = true
    if(this.data.result && this.data.result.length > 0){
      for(let i0=0;i0 < this.data.result.length;i0 ++){
        let frontTm = this.data.result[i0];
        if(!(core.stringUtil.trim(frontTm.questionName)) ){
          core.dialogUtil.showToast({title:'请输入第'+(i0+1)+'题的题干'});
          isSuc = false;
          break;
        }
        if( (frontTm.questionType!='3') && (frontTm.children) && (frontTm.children.length>0)){
          for(let i=0;i<frontTm.children.length;i++){
            if(!(core.stringUtil.trim(frontTm.children[i].optionName)) ){
              core.dialogUtil.showToast({title:'请输入第'+(i0+1)+'题选项'+ frontTm.children[i].optionCode +'的内容'});
              isSuc = false;
              break;
            }
          }
        }
      }
      
    }
    return isSuc;
  },
  /**创建新题目 */
  toAddNewTm:function(){
    //已有题目，判断是否填写完整
    if(!this.checkTm()){
      return false;
    }
    this.initAddNewTm();
  },
  /* 添加初始化题目 */
  initAddNewTm:function(){
    //创建新题目
    let children = [];
    for(let a=0;a<4;a++){//optionName选项内容; String.fromCharCode((65 + a)) 65+0相当与A字母
      children.push({optionId:'',optionCode: String.fromCharCode((65 + a)),optionName:'',isRight:'', canFill: 'N'})
    }
    let obj = {//questionName题目内容；questionType题目类型
      questionId:'', questionName:'',
      questionType:(this.data.questionTypeList && this.data.questionTypeList[0] && this.data.questionTypeList[0].dictCode)?(this.data.questionTypeList[0].dictCode):'',
      children:children//选项
    };
    if(obj.questionType == '3'){
      obj.tips = '';//简答题的提示语
    }
    this.data.result.push(obj);
    this.data.currTmIndex = this.data.result.length -1
    this.setData({
      ['result['+this.data.currTmIndex+']']:this.data.result[this.data.currTmIndex],
      // result:this.data.result,
      currTmIndex:this.data.currTmIndex
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取pkgId的值
    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';
    this.data.onlyWatchActivityInfo = (core.globalData.paramsData.onlyWatchActivityInfo && core.globalData.paramsData.onlyWatchActivityInfo == 'true')?true:false;
    this.setData({
      pkgId:this.data.pkgId,
      onlyWatchActivityInfo:this.data.onlyWatchActivityInfo
    })
    if(this.data.onlyWatchActivityInfo){
      wx.setNavigationBarTitle({//动态设置当前页面的标题
        title: '查看试题'
      })
      this.data.containerBottom = 0;
      this.setData({
        containerBottom:this.data.containerBottom
      });
    }
    this.findQuestionTypeList();
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
    //跳转页面后返回获取result的值后并清空
    if(core.stringUtil.objectIsNotNull(core.globalData.questionnaireData.secondData) ){
      if(core.globalData.questionnaireData.secondData.result && core.globalData.questionnaireData.secondData.result.length>0){
        this.data.result = core.globalData.questionnaireData.secondData.result;
        this.setData({
          result:this.data.result
        })
        core.globalData.questionnaireData.secondData.result = []
      }
      if(core.globalData.questionnaireData.secondData.currTmIndex || (core.globalData.questionnaireData.secondData.currTmIndex == 0) ){
        this.data.currTmIndex = core.globalData.questionnaireData.secondData.currTmIndex;
        this.setData({
          currTmIndex:this.data.currTmIndex
        })
        core.globalData.questionnaireData.secondData.currTmIndex = ''
      }
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
    core.globalData.questionnaireData.secondData.result = this.data.result;
    core.globalData.questionnaireData.secondData.currTmIndex = this.data.currTmIndex;
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

  //跳转到创建问卷页面
  toCreateWJ: function (e) {
    core.globalData.questionnaireData.secondData.result = this.data.result;
    core.globalData.questionnaireData.secondData.currTmIndex = this.data.currTmIndex;
    wx.navigateBack();
  },

  //创建成功返回活动页面
  toActivity: function (e) {
    let that = this
    //已有题目，判断是否填写完整
    if(!this.checkTm()){
      return false;
    }
    let data = {
      pkgId:this.data.pkgId,
      json:JSON.stringify(this.data.result)
    };
    data = Object.assign(data,core.globalData.questionnaireData.firstData);
    core.dialogUtil.showModal({content:'确定保存吗？'},function() {
      core.request({
        url: "wx/activity-api/voteQuestionnaire/saveVoteQuestionnaireInfo?token="+core.globalData.userInfo.token,
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
            core.globalData.questionnaireData.firstData = {}
            core.globalData.questionnaireData.secondData = {}
            core.globalData.paramsData.activityIndex = 1;
            core.service.backPageOnload({num:2});//返回页面，并执行返回的页面的onLoad方法
          }
        }
      });
    },function() {});
    
  }
})