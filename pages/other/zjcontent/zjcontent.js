// pages/other/zjcontent/zjcontent.js
const app = getApp();
const core = require("../../../utils/core/core.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapterInfo:{},//章节信息
    chapterId:'',//章节id
    tabList:[],//选项卡列表
    resContent:'',//章节内容
    pkgId:'',//教学包id
    ctId:'',//课堂id
    subjectId:'',//课程id
    intoOtherChapterData:{
      startX:0,//开始触摸点
      startY:0,//开始触摸点
      time:0,//滑动时间
      interval:null,//时间计时器
      isSlide:false,//是否滑动
    },//动进入 下一章节/上一章节 的 数据
    currTabResIndex:0,//当前选中的选项 的下标
    pageInfo:{},//左右滑动数据
    isAddAct:false,//是否添加了活动
    showTabSetting:false, // 是否 显示tab分组 是否可见 设置   Visible
    tabCanVisibleNumber:0,//tab分组 可以 切换显示给学员 的 数量 dictCode为3的时候才可以显示复选框
    classroomState:'',//课堂状态
    hasSetResVisiblePermission: false,// 是否有 【设置分组权限】  的 权限
    scrollViewInfo:{}, // scroll -view 的 信息
    classroomIdentity:'', // 课堂里面的身份信息
    parserDoMain: core.globalData.serverInfo.imgUrl // 主域名，设置后将对于图片地址将自动拼接主域名或协议名
  },
  /** 切换 tab 学员是否 可见 的 保存  事件  */
  toSetTabVisible: function () {
    let checkeds = [];
    let unCheckeds = [];
    if (this.data.tabList && this.data.tabList.length > 0) {
      this.data.tabList.forEach((item, index) => {
        // if (item.dictCode && item.dictCode == '3') {
          if (item.checked) {
            checkeds.push(item.resgroupId);
          } else {
            unCheckeds.push(item.resgroupId);
          }
        // }
      });
    }
    let data = {
      pkgId: this.data.pkgId,
      ctId: this.data.ctId,
      isTraineesVisible: 'Y',
      resgroupIdList: checkeds,
      unResgroupIdList: unCheckeds
    }
    
    let content = '确定将选中的设为学员【可见】，未选中的设为学员【不可见】吗？'; //'确定将选中的tab分组设为学员【可见】吗？'
    // if(checkeds.length<1){
    //   content = '确定将未选中的tab分组设为学员【不可见】吗？';
    //   // data.isTraineesVisible = 'N';
    //   // data.resgroupIdList = unCheckeds;
    // }
    let that = this;
    core.dialogUtil.showModal({content:content},function() {
      core.request({
        url: 'wx/resource-api/setTraineesVisibleResgroupBatch',
        method: "POST",
        data:data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            that.findTabList();
            that.data.showTabSetting = false;
            that.setData({
              showTabSetting:that.data.showTabSetting
            });
            
          }
        }
      });
    },function() {});


  },
  /** 切换 tab 学员是否 可见 的 CheckBox 事件  */
  tabVisibleCheckBox: function (event) {
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.tabList[currIndex].checked = !(this.data.tabList[currIndex].checked);
    this.setData({
      ['tabList['+currIndex+'].checked']:  this.data.tabList[currIndex].checked
    });
  },
  /** 切换显示  是否 显示tab分组 是否可见 设置  */
  tapSettingTap: function (event) {
    let type = event.currentTarget.dataset.type;
    this.data.showTabSetting = false;
    if (type && type == 'show') {
      this.data.showTabSetting = true;
      if (this.data.tabList && this.data.tabList.length > 0) {
        this.data.tabList.forEach((item, index) => {
          item.checked = (item.isTraineesVisible && item.isTraineesVisible == 'Y') ? true :  false;
        });
        this.setData({
          tabList: this.data.tabList
        });
      }
    }
    this.setData({
      showTabSetting: this.data.showTabSetting
    });
  },
  /**阻止进入上/下一章节 */
  parserScroll:function(){},
  parserScrollTouch (event) {
  },
  parserScrollTab:function(event){
    // console.log('event', event)
    wx.createSelectorQuery().select('.slide_box').boundingClientRect(function(rectContent){
      // console.log('rectContent', rectContent)
    }).exec();
  },
  parserNotScrollTouch: function () {
    let targetEleEvent = event.detail.targetEleEvent;
    if (targetEleEvent.type == 'touchstart') {
      this.intoOtherChapterTouchStart(targetEleEvent);
    } else if (targetEleEvent.type == 'touchmove') {
      this.intoOtherChapterTouchMove(targetEleEvent);
    } else if (targetEleEvent.type == 'touchend') {
      this.intoOtherChapterTouchEnd(targetEleEvent);
    }
  },
  // 富文本出错事件
  error(e) {
    if (e.detail.source == 'ad')
      this.chapterCom.document.getElementById('adContainer').setStyle('display', 'none');
  },
  /**滑动进入 下一章节/上一章节 的触摸移动 事件 */
  intoOtherChapterTouchMove:function(event){
    let moveX = event.changedTouches[0].clientX - this.data.intoOtherChapterData.startX;
    let moveY = event.changedTouches[0].clientY - this.data.intoOtherChapterData.startY;
    let isSlide = false;
    //返回角度 /Math.atan()返回数字的反正切值
    let angle = 360 * Math.atan(moveY / moveX) / (2 * Math.PI);
    if(Math.abs(angle) >30 ){//滑动超过30度
      return false;
    }
    if (moveX < 10 && moveX > -10){
      return false;
    }else if(moveX < -10 && this.data.intoOtherChapterData.time <10){//向左滑动

      this.data.showTabSetting = false;
      this.setData({
        showTabSetting:this.data.showTabSetting
      });


      if( (this.data.currTabResIndex +1) <= (this.data.tabList.length-1) && !this.data.intoOtherChapterData.isSlide ){//切换下一tab
        this.data.intoOtherChapterData.isSlide = true;

        this.data.currTabResIndex = this.data.currTabResIndex +1;
        this.setData({
          ['intoOtherChapterData.isSlide']: this.data.intoOtherChapterData.isSlide,
          currTabResIndex:this.data.currTabResIndex
        })
        this.findChapterContent();
      }else if(!this.data.intoOtherChapterData.isSlide){//进入下一章节

        

        this.data.intoOtherChapterData.isSlide = true;
        this.setData({
          ['intoOtherChapterData.isSlide']: this.data.intoOtherChapterData.isSlide
        });
        if(!this.data.pageInfo.nextChapterId){
          core.dialogUtil.showToast({title:'当前已经是最后一章'});
          return false;
        }else{
          this.data.chapterId = this.data.pageInfo.nextChapterId;
          this.setData({
            chapterId:this.data.chapterId
          })
          core.globalData.paramsData.chapterIdFromCha = this.data.chapterId;
          this.findTabList();
        }
      }
    }else if(moveX > 10 && this.data.intoOtherChapterData.time <10){//向右滑动

      this.data.showTabSetting = false;
      this.setData({
        showTabSetting:this.data.showTabSetting
      });

      if( (this.data.currTabResIndex -1) >=0 && !this.data.intoOtherChapterData.isSlide){//切换上一tab
        this.data.intoOtherChapterData.isSlide = true

        this.data.currTabResIndex = this.data.currTabResIndex -1;
        this.setData({
          ['intoOtherChapterData.isSlide']: this.data.intoOtherChapterData.isSlide,
          currTabResIndex:this.data.currTabResIndex
        })
        this.findChapterContent();
      }else if(!this.data.intoOtherChapterData.isSlide){//进入上一章节
        this.data.intoOtherChapterData.isSlide = true
        this.setData({
          ['intoOtherChapterData.isSlide']: this.data.intoOtherChapterData.isSlide
        });
        if(!this.data.pageInfo.prevChapterId){
          core.dialogUtil.showToast({title:'当前已经是第一章'});
          return false;
        }else{
          this.data.chapterId = this.data.pageInfo.prevChapterId;
          this.setData({
            chapterId:this.data.chapterId
          })
          core.globalData.paramsData.chapterIdFromCha = this.data.chapterId;
          this.findTabList();
        }
      }
    }
  },
  /**滑动进入 下一章节/上一章节 的触摸开始 事件 */
  intoOtherChapterTouchStart:function(event){
    

    clearInterval(this.data.intoOtherChapterData.interval);
    this.data.intoOtherChapterData.interval = null;
    this.data.intoOtherChapterData.startX =  event.changedTouches[0].clientX;
    this.data.intoOtherChapterData.startY =  event.changedTouches[0].clientY;
    let that = this;
    this.data.intoOtherChapterData.isSlide = false;
    that.data.intoOtherChapterData.time = 0;
    this.data.intoOtherChapterData.interval = setInterval(function(){
      that.data.intoOtherChapterData.time ++;
    },100);
    this.setData({
      intoOtherChapterData: this.data.intoOtherChapterData
    });
  },
  /**滑动进入 下一章节/上一章节 的触摸结束 事件 */
  intoOtherChapterTouchEnd:function(event){
    clearInterval(this.data.intoOtherChapterData.interval);
    this.data.intoOtherChapterData.startX =  0;
    this.data.intoOtherChapterData.startY = 0 ;
    this.data.intoOtherChapterData.time = 0;
    this.data.intoOtherChapterData.interval = null;
    this.data.intoOtherChapterData.isSlide = false;
    this.setData({
      intoOtherChapterData: this.data.intoOtherChapterData
    });
  },
  /**去切换 */
  toTab:function(event) {
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.currTabResIndex = currIndex;
    this.setData({
      currTabResIndex:this.data.currTabResIndex
    })
    this.findChapterContent();
  },
  /**获取 选项卡列表数据*/
  findTabList:function(){
    let that = this;
    that.data.tabCanVisibleNumber = 0;
    that.data.chapterInfo = {};
    that.data.tabList = [];
    that.data.pageInfo = {};
    that.data.hasSetResVisiblePermission = false;
    that.setData({
      tabCanVisibleNumber:that.data.tabCanVisibleNumber,
      chapterInfo:that.data.chapterInfo,
      pageInfo:that.data.pageInfo,
      tabList:that.data.tabList,
      hasSetResVisiblePermission: that.data.hasSetResVisiblePermission
    })

    let data = {
      pkgId:this.data.pkgId,
      ctId:this.data.ctId,
      chapterId:this.data.chapterId,
    };
    if(!data.chapterId){
      return false;
    }
    // "wx/resource-api/getChapterInfo"
    core.request({
      url: "wx/resource-api/slide",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          that.data.chapterInfo = {};
          that.data.tabList = [];
          that.data.pageInfo = {};
          if(res.data.data && core.stringUtil.objectIsNotNull(res.data.data.chapterInfo)){
            that.data.chapterInfo = res.data.data.chapterInfo;
          }
          if(res.data.data && core.stringUtil.objectIsNotNull(res.data.data.page)){
            that.data.pageInfo = res.data.data.page;
          }
          if(res.data.data && res.data.data.pkgResGroupList && res.data.data.pkgResGroupList.length>0){
            that.data.tabList = res.data.data.pkgResGroupList;
            that.data.tabList.forEach((item, index) => {
              if (item && item.dictCode == '3') {
                that.data.tabCanVisibleNumber++;
              }
            });
            that.setData({
              tabCanVisibleNumber: that.data.tabCanVisibleNumber
            })


            if(!that.data.isAddAct){
              that.data.currTabResIndex = 0;
            }else{
              for(let a2=0;a2<res.data.data.pkgResGroupList.length;a2++){
                if(res.data.data.pkgResGroupList[a2].dictCode == '2'){
                  that.data.currTabResIndex = a2;
                  break;
                }
              }
            }
            that.setData({
              currTabResIndex:that.data.currTabResIndex
            })
          }


          that.data.hasSetResVisiblePermission = (res.data.data && res.data.data.hasSetResVisiblePermission)?true:false;

          that.setData({
            chapterInfo:that.data.chapterInfo,
            pageInfo:that.data.pageInfo,
            tabList:that.data.tabList,
            hasSetResVisiblePermission: that.data.hasSetResVisiblePermission
          })
          that.findChapterContent();
        }
      }
    });
  },
  /** 监听 视频或者音频的 自然播放结束事件 */
  ended: function (event) {
    // console.log('event', event)
    let info = event.detail.info.currentTarget.dataset;
    if (!info || !info.attrs || !info.attrs.readId) {
      return false;
    }
    let id  = info.attrs.readId; // audio1
    if (info.source && info.source == 'video') {
      this.chapterReaded('viewVideo',{videoId: id})
    } else if (info.source && info.source == 'audio') {
      this.chapterReaded('viewAudio',{audioId: id})
    }
  },
  /** 查看课程内容，滑动到最下面时，触发此接口   */
  chapterReaded: function (url,obj) {
    let data = {
      ctId: this.data.ctId,
      pkgId: this.data.pkgId,
      subjectId: this.data.subjectId,
      chapterId: this.data.chapterId,
      
    }
    if (url == 'viewChapter') {
      data.resId = (this.data.tabList && this.data.tabList[this.data.currTabResIndex] && this.data.tabList[this.data.currTabResIndex].resId) ? (this.data.tabList[this.data.currTabResIndex].resId) : '';
      if(!data.resId){
        return false;
      }
    } else {
      data = Object.assign(data, obj);
    }
    core.request({
      isSucShowToast: false,
      isShowLoading: 'false',
      url: 'wx/classroom-api/empirical/log/' + url,
      method: "POST",
      data:data,
      success: function(res) {
      }
    });
  },
  /** scroll-view 的 滚动 事件  */
  scrollViewScroll: function (event) {
    // console.log('event', event)
    if (event.detail.scrollTop + this.data.scrollViewInfo.height == event.detail.scrollHeight ) { // 章节滑动到内容底部
      this.chapterReaded('viewChapter');
    }
  },
  /**获取 章节内容 数据*/
  findChapterContent:function(){
    let that = this;
    that.data.resContent = '';
    that.setData({
      resContent: that.data.resContent
    })
    if(!this.data.tabList || (this.data.tabList && !this.data.tabList[this.data.currTabResIndex])  || (this.data.tabList && this.data.tabList[this.data.currTabResIndex] && !this.data.tabList[this.data.currTabResIndex].resgroupId ) ){
      return false;
    }
    let data = {
      resgroupId: this.data.tabList[this.data.currTabResIndex].resgroupId,
    };
    core.request({
      url: "wx/resource-api/getChapterContent",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          that.data.resContent = '';
          if (res.data.data && res.data.data.resContent){
            that.data.resContent = res.data.data.resContent;
          }
          that.setData({
            resContent:that.data.resContent
          })

          if (that.data.classroomIdentity && (that.data.classroomIdentity == 'assistant' || that.data.classroomIdentity == 'student') ){
            wx.createSelectorQuery().select('.scroll_view').boundingClientRect(function(rect){
              that.data.scrollViewInfo = rect;
              that.setData({
                scrollViewInfo: that.data.scrollViewInfo
              });
              wx.createSelectorQuery().select('.chapter_content').boundingClientRect(function(rectContent){
                if (rect && rect.height && rectContent && rectContent.height && rect.height > rectContent.height) { // 当前章节内容未满 一页 ,章节滑动到内容底部
                  that.chapterReaded('viewChapter');
                }
              }).exec();
            }).exec();
          }


        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取系统信息
    core.service.getSystemInfoToHandleGlobalData();
    this.data.chapterId = (options && options.chapterId)?(options.chapterId):( (core.globalData.paramsData.chapterIdFromCha)?(core.globalData.paramsData.chapterIdFromCha):'' );

    this.data.isAddAct = false;
    if(!options || (options && !options.chapterId)){
      this.data.isAddAct = true;
    }

    core.globalData.paramsData.chapterIdFromCha = this.data.chapterId;

    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';

    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.classroomState =  (core.globalData.paramsData.classroomState) ? (core.globalData.paramsData.classroomState):'';

    this.data.subjectId = (core.globalData.paramsData.subjectId) ? (core.globalData.paramsData.subjectId):'';

    this.data.classroomIdentity = (core.globalData.paramsData.classroomIdentity) ? (core.globalData.paramsData.classroomIdentity):'';

    this.setData({
      isAddAct:this.data.isAddAct,
      pkgId:this.data.pkgId,
      ctId:this.data.ctId,
      chapterId:this.data.chapterId,
      subjectId:this.data.subjectId,
      classroomIdentity:this.data.classroomIdentity,
      classroomState:this.data.classroomState
    })
    this.findTabList();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.chapterCom = this.selectComponent('#chapterParser');
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