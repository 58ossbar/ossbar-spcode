// components/picker/picker.js
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
    isShowPicker:{//组件是否显示
      type:Boolean,
      value: false
    },
    title:{//标题
      type:String,
      value:''
    },
    listData:{//列表数据
      type:Array,
      value:[]
    },
    type:{//类型，默认为单选
      type:String,
      value:'radio'
    },
    defaultData:{// 默认选择的 列表数据的 id 组合
      type:Array,
      value:[]
    },
    keyIdOfShow: {// picker的 数组 中 要获取的id的 name
      type: String,
      value: ''
    },
    keyWordOfShow: {// picker的 数组 中 要展示的文字的 关键字
      type: String,
      value: 'dictValue'
    },
    isSlot: {// picker是否开启自定义slot
      type:   Boolean,
      value: false
    },
  },
   /**数据监听器支持监听属性或内部数据的变化，可以同时监听多个 */
  observers:{
    'isShowPicker':function(isShowPicker){
      if(this.properties.isShowPicker){
        isShowPicker = true;
        this._openPicker();
      }else{
        this._closePicker();
      }
    },
    'listData,defaultData':function(listData,defaultData){
      listData = this.properties.listData;
      defaultData = this.properties.defaultData;
      this._setColumnsData();
    },
    
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShow:false,// 是否显示
    columnsData:[],//列表数据
    columnsIndexList:[],//被选中数据的下标数组
    scrollEnd: true, // 滚动是否结束
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**对列表数据和被选中数据的下标数组进行处理 */
    _setColumnsData:function(){
      let listData = this.properties.listData;
      let keyIdOfShow = this.properties.keyIdOfShow;
      this.data.columnsIndexList = [];
      this.data.columnsData = [];
      if(listData && listData.length>0){
        let defaultData = this.properties.defaultData;
        for(let i=0;i< listData.length;i++){
          listData[i].isChecked = false;
          if(defaultData && defaultData.length>0 ){
            for(let i2=0;i2< defaultData.length;i2++){
              if(listData[i][keyIdOfShow] == defaultData[i2]){
                listData[i].isChecked = true;
                this.data.columnsIndexList.push(i);
                break;
              }
            }
          }else{
            // listData.length <2 && 
            if(this.properties.type == 'picker_radio'){
              this.data.columnsIndexList = [0];
            }
          }
        }
        this.data.columnsData = listData;
      }
      this.setData({
        columnsData:this.data.columnsData,
        columnsIndexList:this.data.columnsIndexList
      })
    },
    /**显示 picker */
    _openPicker:function(){
      this.properties.isShowPicker = true;
      this.data.isShow = true;
      this.setData({
        isShow:this.data.isShow
      })
    },
    /**关闭picker */
    _closePicker :function(){
      this.properties.isShowPicker = false;
      this.data.isShow = false;
      this.setData({
        isShow:this.data.isShow
      })
    },
    /**点击按钮  */
    clickBtn: function (event) {
      let type = event.currentTarget.dataset.type;
      let keyIdOfShow = this.properties.keyIdOfShow;
      if(type == 'confirm'){
        if(!this.data.scrollEnd){//滚动未结束
          return false;
        }
        let dataList = [];//数据项集合
        let idList = [];//id集合
        let columnsIndexList = this.data.columnsIndexList;
        if(columnsIndexList && columnsIndexList.length>0){
          for(let a=0;a<columnsIndexList.length;a++){
            dataList.push(this.data.columnsData[columnsIndexList[a]]);
            idList.push(this.data.columnsData[columnsIndexList[a]][keyIdOfShow]);
          }
        } 
        this.triggerEvent('close',{type:type,dataList:dataList,indexList:columnsIndexList,idList:idList});
      }else if(type == 'cancel'){
        this.triggerEvent('close',{type:type});
      }else if(type == 'tapMark'){
        this.triggerEvent('close',{type:type});
      }

      this._closePicker();
    },
    /**滚动开始 */
    _pickStart:function(){
      this.data.scrollEnd = false;
      this.setData({
        scrollEnd:this.data.scrollEnd
      })
    },
    /**滚动结束 */
    _pickEnd:function(){
      this.data.scrollEnd = true;
      this.setData({
        scrollEnd:this.data.scrollEnd
      })
    },
    /**单选 change事件 */
    _radioChange:function(event){
      this.data.columnsIndexList = [];
      this.data.columnsIndexList.push(event.detail.value);
      this.setData({
        columnsIndexList:this.data.columnsIndexList
      });
    },
     /**多选 change事件 */
     _checkboxChange:function(event){
      this.data.columnsIndexList = event.detail.value;
      this.setData({
        columnsIndexList:this.data.columnsIndexList
      });
    },

  }


})
