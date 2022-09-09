// components/no-data/no-data.js
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
    isShow:{//组件是否显示
      type:Boolean,
      value: false
    },
    img:{//显示的图片
      type:String,
      value:'creatkc.png'
    },
    label:{//显示的文字
      type:String,
      value:'暂无数据'
    },
    type:{//类型
      type:String,
      value:'1'
    },
    isVerticalCenter:{//是否垂直 居中
      type:Boolean,
      value:true
    }
  },
  /**数据监听器支持监听属性或内部数据的变化，可以同时监听多个 */
  observers:{
    'img':function(img){
      img = this.properties.img;
      if((this.properties.img) && ((this.properties.img).indexOf("http")< 0) ){
        img = '../../images/'+ this.properties.img;
      }
      this.setData({
        showImg:img
      })
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    showImg:'',//具体要显示的图片
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }




})
