// components/class-room-bar/class-room-bar.js
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
    isShowIndex:{//当前页面的下标
      type:Number,
      value:1
    },
    isShowIndexNav:{//当前页面是否可以跳转
      type:Boolean,
      value:false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    footMenuList:[
      {name:'资源',isMess:false,icon:'iconlist'},
      {name:'活动',isMess:false,icon:'iconhuodong'},
      {name:'成员',isMess:false,icon:'iconactivitychengyuan'},
      {name:'消息',isMess:true,icon:'iconxiaoxi'}
    ],//当前 数组
  },
  pageLifetimes: {//组件所在页面的生命周期声明对象
    show: function() {// 页面被展示
      // 获取系统信息
      core.service.getSystemInfoToHandleGlobalData();

      let query = this.createSelectorQuery();
      let that = this;
      query.select('.footMenu_box').boundingClientRect(function(menuRes) {
        let obj= (menuRes && core.stringUtil.objectIsNotNull(menuRes)) ? (Object.assign({},menuRes)) : {};
        // 将xml信息返回
        that.triggerEvent('footMenuBoxInfo',{menuRes:obj});
      }).exec();
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**切换页面 */
    toTapPage:function(event){
      let currIndex = event.currentTarget.dataset.currindex;
      if(currIndex == 0){
        wx.redirectTo({
          url: '/pages/classroom/resource/resource',
        })
      }else if(currIndex == 1){
        wx.redirectTo({
          url: '/pages/classroom/activity/activity'
        })
      }else if(currIndex == 2){
        wx.redirectTo({
          url: '/pages/classroom/member/member', 
        })
      }else if(currIndex == 3){
        wx.redirectTo({
          url: '/pages/classroom/message/message',
        })
      }
    }

  }
})
