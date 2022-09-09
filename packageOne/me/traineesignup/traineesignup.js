// pages/apply/applyInfo/applyInfo.js
const core = require("../../../utils/core/core.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataForm: {
      name:'',//真实姓名
      education:'',//学历
      qq:'',//QQ 号码
      wechatNumber:'',//  微信账号
      mobile:'',//手机号码
      classId:'',//班级
      isPay: 'N' // 是否缴费
    },
    switchDisabled: false, // switch是否可以选中
    educationList:[],// 学历 列表
    educationIndex:0,// 当前被选中的学历列表 的下标
    classIdList:[],// 班级 列表
    classIdIndex:0,// 当前被选中的班级列表 的下标
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
    modalIsShow:false,//弹窗是否显示
    buttonOpenType:'getUserInfo',//授权时 拿的信息
    chooseClassId: true, // 是否可以选择班级
  },
   /**picker 点击 按钮 返回的事件 */
   pickerClose:function(event){
    this.data.pickerDatas.isShowPicker = false;
    this.setData({
      ['pickerDatas.isShowPicker']:this.data.pickerDatas.isShowPicker
    })
    if(event.detail.type == 'confirm'){//点击确定
      let name = this.data.pickerDatas.namePicker;
      this.data.dataForm[name] = (event.detail.idList && event.detail.idList.length>0)?( event.detail.idList[0]):'';
      this.setData({
        ['dataForm.'+name]:this.data.dataForm[name]
      })
      this.data[name+'Index'] = (event.detail.indexList)?( event.detail.indexList ):[]; 
      this.setData({
        [name+'Index']:this.data[name+'Index']
      })
      
    }else if(event.detail.type == 'cancel'){//点击取消

    }
  },
  /**添加 学历 类型 */
  toAddEducation:function(event){
    // 判断是否授权
    if (!this.judgeIsToken(false)) {
      return false
    }

    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择学历';
    this.data.pickerDatas.listDataPicker = this.data.educationList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.education)?( (this.data.dataForm.education).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'dictValue';
    this.data.pickerDatas.keyIdOfShowPicker = 'dictCode';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**添加 班级 类型 */
  toAddClassId:function(event){
   // 判断是否授权
   if (!this.judgeIsToken(false)) {
    return false
  }

    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择班级';
    this.data.pickerDatas.listDataPicker = this.data.classIdList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.classId)?( (this.data.dataForm.classId).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'className';
    this.data.pickerDatas.keyIdOfShowPicker = 'classId';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**获取 学历 列表 */
  findListEducationList:function(){
    this.data.switchDisabled = true
    this.setData({
      'switchDisabled': this.data.switchDisabled
    })

    let that = this;
    core.request({
      url: "wx/api/order/getTraineeEducation",
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.data.educationList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.dataForm.education) && ( res.data.data[i].dictCode == that.data.dataForm.education )){
                that.data.educationIndex = i;
                break;
              }
            }
            that.data.educationList = res.data.data;
            if(!that.data.dataForm.education){
              that.data.dataForm.education = that.data.educationList[0].dictCode;
              that.data.educationIndex = 0;
            }
          }
          that.setData({
            educationList: that.data.educationList,
            ['dataForm.education']: that.data.dataForm.education,
            educationIndex: that.data.educationIndex
          })
        }
      }
    });
  },
  /**获取 班级 列表 */
  findListClassIdList:function(){
    let that = this;
    core.request({
      url: "wx/api/order/queryClassList",
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.data.classIdList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.dataForm.classId) && ( res.data.data[i].classId == that.data.dataForm.classId )){
                that.data.classIdIndex = i;
                break;
              }
            }
            that.data.classIdList = res.data.data;
            if(!that.data.dataForm.classId){
              that.data.dataForm.classId = that.data.classIdList[0].classId;
              that.data.classIdIndex = 0;
            }
          }
          that.setData({
            classIdList: that.data.classIdList,
            ['dataForm.classId']: that.data.dataForm.classId,
            classIdIndex: that.data.classIdIndex
          })
        }
      }
    });
  },
  /**保存 */
  save:function(){
    // 判断是否授权
    if (!this.judgeIsToken(false)) {
      return false
    }

    let that = this;
    let data = {};
    data = Object.assign(data,this.data.dataForm);
    
    if(!(core.stringUtil.trim(data.name)) ){
      core.dialogUtil.showToast({title:'真实姓名不能为空，请输入真实姓名'})
      return false;
    }
    if(!(core.stringUtil.trim(data.education)) ){
      core.dialogUtil.showToast({title:'学历不能为空，请选择学历'})
      return false;
    }
    // if(!(core.stringUtil.trim(data.qq)) ){
    //   core.dialogUtil.showToast({title:'QQ 号码不能为空，请输入QQ 号码'})
    //   return false;
    // }

    if(!(core.stringUtil.trim(data.classId)) ){
      core.dialogUtil.showToast({title:'班级不能为空，请选择班级'})
      return false;
    }
        
   if (core.stringUtil.trim(data.qq)) {
    if(!( core.validateUtil.checkQq('QQ 号码',data.qq,true) ) ){
      return false;
    }
   }
   if (core.stringUtil.trim(data.mobile)) {
    if(!( core.validateUtil.checkPhone(data.mobile) ) ){
      return false;
    }
   }

    data.classid = data.classId

    let educationName = that.data.educationList && that.data.educationList[that.data.educationIndex] && that.data.educationList[that.data.educationIndex].dictValue?that.data.educationList[that.data.educationIndex].dictValue:''

    let classIdName = that.data.classIdList && that.data.classIdList[that.data.classIdIndex] && that.data.classIdList[that.data.classIdIndex].dictValue?that.data.classIdList[that.data.classIdIndex].dictValue:''

    let modalContent = "提交前请确认以下信息：\r\n1、您的个人信息：\r\n1）姓名：" + data.name + "\r\n2）学历：" + educationName + "\r\n3）班级：" + classIdName + "\r\n4）QQ：" + data.qq + "\r\n5）手机号：" + data.mobile + "\r\n6）微信号：" + data.wechatNumber + "\r\n2、您已阅读报名须知，并同意报名相关要求";

    core.dialogUtil.showModal({content:'提交前请确认信息，确定报名吗？'},function() {
      core.request({
        url: "wx/api/order/signup",
        method: "POST",
        data:data,
        // header: {
        //   'content-type': 'application/json' // 默认值
        // },
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg});
            }
            // core.service.backPageOnload();//返回页面，并执行返回的页面的onLoad方法
            if (data.isPay && data.isPay == 'Y') {
              core.request({
                url: "wx/api/order/payparam",
                method: "POST",
                data: { ofid: res.data.ofid },
                // header: {
                //   'content-type': 'application/json' // 默认值
                // },
                success: function(res) {
                  if(res.data.code == 0){
                    var payinfo = res.data.payinfo;
                    payinfo.success = function () {
                      core.dialogUtil.showToast({title: '支付成功，请保持手机畅通！'});
                      setTimeout(function(){
                        wx.reLaunch({  
                          url: '/pages/tabbar/percenter/percenter'
                        })
                      },core.globalData.operState.duration);
                    }
                    payinfo.fail = function (res) {
                      core.dialogUtil.showToast({title: '支付失败，您可以在“我的订单”功能中继续支付！'});
                      setTimeout(function () {
                        wx.reLaunch({  
                          url: '/pages/tabbar/percenter/percenter'
                        })
                      }, core.globalData.operState.duration0);
                    }
                    wx.requestPayment(payinfo);
                  }
                }
              });
            } else {
              wx.reLaunch({  
                url: '/pages/tabbar/percenter/percenter'
              })
            }
          }
        }
      });
    },function() {});
  },
  /**监听 输入框 的实时输入事件 */
  bindinput:function(event){
    // 判断是否授权
    if (!this.judgeIsToken(false)) {
      return false
    }

    let name = event.currentTarget.dataset.name
    this.data.dataForm[name] = event.detail.value
    this.setData({
      ['dataForm.'+name]:this.data.dataForm[name]
    })
  },
  //监听是否审核
  switchChange:function(e){
    // 判断是否授权
    if (!this.judgeIsToken(false)) {
      return false
    }

    let name = e.currentTarget.dataset.name;
    this.data.dataForm[name] = (e.detail.value)?'Y':'N';
    this.setData({
      ['dataForm.'+name]:this.data.dataForm[name]
    });
  },
  /**取消 */
  cancel:function(){
    // 判断是否授权
    if (!this.judgeIsToken(false)) {
      return false
    }

    wx.navigateBack();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.chooseClassId = (options && options.chooseClassId && options.chooseClassId == 'false')?false:true;
    this.setData({
      chooseClassId: this.data.chooseClassId
    });
    if (options && options.classId) {
      this.data.dataForm.classId = options.classId;
      this.setData({
        'dataForm.classId': this.data.dataForm.classId
      });
    }

    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 判断是否授权 并清空全局变量
    let that = this;
    core.service.judgeIsAuthorize('baoming',function(suc){
      that.authorizedFun(suc);
    },function(){
      that.setData({
        modalIsShow:true,
        buttonOpenType:'getUserInfo'
      })
    })
  },
  judgeIsToken: function (isFun = true) {
    let that = this
    let result = false
    //判断是否授权
    if (core.globalData.userInfo.hasUserInfo && core.paramUtil.getData("userInfo") && core.paramUtil.getData("userInfo").state ){//已授权
      if(!core.service.isCanInto()){
        if (isFun) {
          setTimeout(function(){
            that.setData({
              modalIsShow:true,
              buttonOpenType:'getPhoneNumber'
            })
          },core.globalData.operState.duration);
          // return false;
        }
      } else {
        result = true
      }
    }else{//未授权
      if (isFun) {
        this.onShow();
        // return false;
      }
    }
    // this.data.switchDisabled = result
    // this.setData({
    //   'switchDisabled': this.data.switchDisabled
    // })
    return result
  },
  /**微信授权弹窗点击确定 进行用户授权 */
  getUserInfo: function(event) {
    // 用户点击授权后，这里可以做一些登陆操作
    let that = this
    core.service.authorizeGetUserInfoComm(event,function(suc){
      that.authorizedFun(suc);
    },function(){
      wx.reLaunch({
        url: '/packageOne/me/traineesignup/traineesignup',
      })
    })
  },
  /**登录成功后的事件 */
  getPhoneNumberBack:function(){
    let that = this
    if( core.globalData.myInfo){
      that.data.dataForm.name = core.globalData.myInfo.basicInfo.traineeName
      that.data.dataForm.education =core.globalData.myInfo.basicInfo.traineeEducation
      that.data.dataForm.qq = core.globalData.myInfo.basicInfo.traineeQq
      that.data.dataForm.mobile = core.globalData.myInfo.basicInfo.mobile
      that.data.dataForm.wechatNumber = core.globalData.myInfo.basicInfo.wechatNumber

      that.setData({
        dataForm:that.data.dataForm
      });
      that.findListEducationList();
      that.findListClassIdList();
    }
  },
  /**已授权要做的事情 */
  authorizedFun:function(isQrcode){
    let that = this;
    //对扫码进入小程序进行处理， 类型和 邀请码、时间  ，跳到课堂里面
    // t：为type调整类型的简称，01表示跳课堂; c：为code邀请码的简称;  e:为time时间的简称，示例：20200724162900
    //获取个人信息
    core.service.findUserInfoFromMysal({isShowLoading:'false'},function(suc){
      core.globalData.myInfo = suc.data;

      if(!core.service.isCanInto()){
        setTimeout(function(){
          that.setData({
            modalIsShow:true,
            buttonOpenType:'getPhoneNumber'
          })
        },core.globalData.operState.duration);
        return false;
      }
      if( suc.data){
        that.data.dataForm.name = suc.data.basicInfo.traineeName
        that.data.dataForm.education = suc.data.basicInfo.traineeEducation
        that.data.dataForm.qq = suc.data.basicInfo.traineeQq
        that.data.dataForm.mobile = suc.data.basicInfo.mobile
        that.data.dataForm.wechatNumber = suc.data.basicInfo.wechatNumber

        that.setData({
          dataForm:that.data.dataForm
        });
        that.findListEducationList();
        that.findListClassIdList();
      }

    });
    
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