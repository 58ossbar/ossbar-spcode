// components/cb-modal/cb-modal.js
const core = require("../../utils/core/core.js")
Component({
  /**一些组件选项 */
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    addGlobalClass: true //表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面
  },
  /**
   * 组件的属性列表
   */
  properties: {
    show: { //是否显示modal弹窗
      type: Boolean,
      value: false
    },
    title: {// 弹窗的标题
      type: String,
      value: '提示'
    },
    modalType: {// 弹窗的类型，text为文字显示，textarea为显示输入框
      type: String,
      value: 'text'
    },
    content: {//弹窗的内容
      type: String,
      value: ''
    },
    confirmText: {//确定按钮的文字信息
      type: String,
      value: '确定'
    },
    cancelText: {//取消按钮的文字信息
      type: String,
      value: '取消'
    },
    showCancel:{ //是否显示取消按钮
      type: Boolean,
      value: true
    },
    showConfirm:{ //是否显示确定按钮
      type: Boolean,
      value: true
    },
    showButton:{ //是否显示授权按钮
      type: Boolean,
      value: false
    },
    buttonOpenType:{ //授权时 拿的信息
      type: String,
      value: 'getUserInfo'
    },
    activityPic:{//活动 弹窗的图片
      type: String,
      value: ''
    },
    activityPicIsIconalbb:{//活动 弹窗的图片 是否 是字体图标
      type: Boolean,
      value: false
    },
    modalCurrIndex:{// 活动 弹窗的数组 的 当前的下标
      type:Number,
      value: -1
    },
    textareaOldValue:{// 弹窗原来的值
      type:String,
      value: ''
    },
    isSlotContent:{// 是否插入自定义 内容
      type:Boolean,
      value: false
    },
  },
  /**数据监听器支持监听属性或内部数据的变化，可以同时监听多个 */
  observers:{
    'buttonOpenType':function(buttonOpenType){
      buttonOpenType = this.properties.buttonOpenType;
      this.data.canIUseGetUserProfile = false;
      if(buttonOpenType == 'getUserInfo'){
        this.properties.title = '微信授权';
        this.properties.content = '小程序申请获得你的公开信息(昵称，头像等)';
        if (wx.getUserProfile) {
          this.data.canIUseGetUserProfile = true;
        }
      }else if(buttonOpenType == 'getPhoneNumber'){
        this.properties.title = '微信授权';
        this.properties.content = '小程序申请获得你的手机号码';
      }
      this.setData({
        canIUseGetUserProfile: this.data.canIUseGetUserProfile,
        title:this.properties.title,
        content:this.properties.content
      })
    },
    'showButton':function(showButton){
      showButton = this.properties.showButton;
      if(showButton){
        this.properties.showConfirm = false;
        this.properties.showCancel = false;
        this.data.canIUseGetUserProfile = false;
        if (wx.getUserProfile) {
          this.data.canIUseGetUserProfile = true;
        }
        this.setData({
          canIUseGetUserProfile: this.data.canIUseGetUserProfile,
          showConfirm:this.properties.showConfirm,
          showCancel:this.properties.showCancel
        })
      }
    },
    'show':function(show){
      show = this.properties.show;
      if(show){
        this._openModal();
      }else{
        this._closeModal();
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    textareaValue:'',//文本域输入的值
    isShow:false,//组件是否显示
    canIUseGetUserProfile: false, // 是否可以使用 获取用户信息 wx.getUserProfile 新接口
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**关闭弹窗 */
    _closeModal:function(){
      this.properties.show = false;
      this.data.isShow = false;
      this.setData({
        isShow:this.data.isShow
      });
    },
    /**打开弹窗 */
    _openModal:function(){
      this.properties.show = true;
      this.data.isShow = true;
      this.data.textareaValue = '';
      if(this.properties.textareaOldValue){
        this.data.textareaValue = this.properties.textareaOldValue;
      }
      this.setData({
        isShow:this.data.isShow,
        textareaValue:this.data.textareaValue
      });

    },
    // 点击modal的回调函数
    clickMask() {
      // 点击modal背景关闭遮罩层，如果不需要注释掉即可
      // this.setData({show: false})
    },
    _bindinput(event) {
      this.setData({
        textareaValue:event.detail.value
      });
    },
    /**获取手机号码 */
    getPhoneNumber(event){
      this._closeModal();
      if(event.detail.errMsg == 'getPhoneNumber:ok'){
        let that = this;
        core.request({
          url: "wx/api/doLogin",
          data: {
            encryptedData:event.detail.encryptedData,
            iv:event.detail.iv,
          },
          success: function (res) {
            if (res.data.code == 0) {
              core.dialogUtil.showToast({ title: '登录成功' });
              // 是否注册了手机0注册1未注册
              core.globalData.userInfo.state = '0';
              core.globalData.userInfo = Object.assign(core.globalData.userInfo,{});
              core.paramUtil.setData("userInfo", core.globalData.userInfo);
              that.triggerEvent("getPhoneNumberBack", {type:'success'});
            }
          }
        });
      }else{
        this.properties.buttonOpenType= 'getPhoneNumber';
        this.setData({
          buttonOpenType:this.properties.buttonOpenType
        })
        this._openModal();
      }
      
    },
    /**获取用户信息 新接口 */
    getUserProfile() {
      let that = this
      that._closeModal();
      // console.log('getUserProfile')
      wx.getUserProfile({
        desc: '获得你的公开信息(昵称，头像等)',
        success: res => {
          // console.log('res', res)
          let obj = {
            errMsg: (res && res.errMsg)?(res.errMsg):'',
            rawData: (res && res.rawData)?(res.rawData):'',
            userInfo: (res && res.userInfo)?(res.userInfo):{},
          }
          that.triggerEvent("getUserInfo", obj);
        },
        fail: fail => {
          //拒绝授权
          // console.log('fail', fail)
          let obj = {
            errMsg: (fail && fail.errMsg)?(fail.errMsg):'',
            rawData: (fail && fail.rawData)?(fail.rawData):'',
            userInfo: (fail && fail.userInfo)?(fail.userInfo):{},
          }
          that.triggerEvent("getUserInfo", obj);
        }
      })
    },
    /**获取用户信息 */
    getUserInfo(event){
      this._closeModal();
      this.triggerEvent("getUserInfo", event.detail);
    },
   // 点击取消按钮的回调函数
    cancel() {
      this._closeModal();
      this.data.textareaValue = '';
      this.setData({
        textareaValue:this.data.textareaValue
      });
      this.triggerEvent('close',{confirm:false,modalCurrIndex:this.properties.modalCurrIndex});
    },
    // 点击确定按钮的回调函数
    confirm() {
      this._closeModal();
      this.triggerEvent('close',{confirm:true,textareaValue:this.data.textareaValue,modalCurrIndex:this.properties.modalCurrIndex});
    }
  }
})
