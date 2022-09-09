// pages/other/resource/resource.js
const app = getApp()
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapterName:'',//章节名称
    subjectId:'',//课程id
    subjectInfo:{},//教材信息
    currChapterInfo:{},//要添加的章节的 信息
    classType:'',//1加入的课堂（我听的课）2自己创建的课堂（我教的课）
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    pkgId:'',//教学包id
    noDataResIsShow:false,//暂无数据是否显示
    chapterTreeList:[],
    ctId:'',//课堂id
    classroomState:'',//课堂状态
    sourseFrom:'',//来自那里，'setActivityChapter'从创建活动过来
    currActivityChapterId:'',//创建活动时选择的章节
    onlyWatchActivityInfo:false,//是否查看信息
  },
  /**创建活动时选择的章节 的checkbox事件 */
  setActivityChapterCheckBox:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.currActivityChapterId = this.data.subjectInfo.children[currIndex].chapterId;
    this.setData({
      currActivityChapterId:this.data.currActivityChapterId
    })
  },
  /**取消 */
  setActivityChapterCancel:function(){
    wx.navigateBack();
  },
  /**保存 */
  setActivityChapterSave:function(){
    core.globalData.paramsData.setActivityChapterData = {
      currActivityChapterId : this.data.currActivityChapterId
    };
    wx.navigateBack();
  },
  /**checkbox-group 的change事件 */
  checkboxChange:function(event){
    if(this.data.subjectInfo && this.data.subjectInfo.children && this.data.subjectInfo.children.length>0){
      let children = this.data.subjectInfo.children;
      for(let i=0;i<children.length;i++){
        children[i].isTraineesVisible = 'N';
      }
      this.setData({
        ['subjectInfo.children']:children
      })
    }
    if(event.detail.value && event.detail.value.length>0 && this.data.subjectInfo && this.data.subjectInfo.children && this.data.subjectInfo.children.length>0){
      let children = this.data.subjectInfo.children;
      let da = event.detail.value;
      for(let i=0;i<da.length;i++){
        children[parseInt(da[i])].isTraineesVisible = 'Y';
      }
      for(let i=0;i<children.length;i++){
        let allnum = 0;
        let visinum = 0;
        for(let a=0;a<children.length;a++){
          if(children[a].parentId == children[i].chapterId){
            allnum ++;
            if(children[a].isTraineesVisible && children[a].isTraineesVisible == 'Y'){
              visinum++;
            }
          }
          let allnum2 = 0;
          let visinum2 = 0;
          for(let a2=0;a2<children.length;a2++){
            if(children[a2].parentId == children[a].chapterId){
              allnum2 ++;
              if(children[a2].isTraineesVisible && children[a2].isTraineesVisible == 'Y'){
                visinum2++;
              }
            }
          }
          if(allnum2 >0){
            if(visinum2 < allnum2 ){
              children[a].isTraineesVisible = 'N';
            }else{
              children[a].isTraineesVisible = 'Y';
            }
          }
        }
        if(allnum >0){
          if(visinum < allnum ){
            children[i].isTraineesVisible = 'N';
          }else{
            children[i].isTraineesVisible = 'Y';
          }
        }
      }
      this.setData({
        ['subjectInfo.children']:children
      })
    }

  },
  /**一级章节的checkbox事件 */
  checkboxOne:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let children = this.data.subjectInfo.children;
    children[currIndex].isTraineesVisible = (children[currIndex].isTraineesVisible == 'Y')?'N':'Y';

    for(let a=0;a<children.length;a++){
      if(children[a].parentId == children[currIndex].chapterId){
        children[a].isTraineesVisible = children[currIndex].isTraineesVisible;
        for(let a1=0;a1<children.length;a1++){
          if(children[a1].parentId == children[a].chapterId){
            children[a1].isTraineesVisible = children[a].isTraineesVisible;
          }
        }
      }
    }
    this.setData({
      ['subjectInfo.children']:children
    })
  },
  /**二级章节的checkbox事件 */
  checkboxTwo:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let children = this.data.subjectInfo.children;
    children[currIndex].isTraineesVisible = (children[currIndex].isTraineesVisible == 'Y')?'N':'Y';
    
    let allnum = 0;
    let visinum = 0;
    let lastIndex = -1;
    for(let a=0;a<children.length;a++){
      if(children[a].parentId == children[currIndex].chapterId){
        children[a].isTraineesVisible = children[currIndex].isTraineesVisible;
      }
      if(children[a].parentId == children[currIndex].parentId){
        allnum ++;
        if(children[a].isTraineesVisible && children[a].isTraineesVisible == 'Y'){
          visinum++;
        }
      }
      if(children[a].chapterId == children[currIndex].parentId){
        lastIndex = a;
      }
    }
    if(allnum >0 && visinum >=1 && lastIndex >-1){
      children[lastIndex].isTraineesVisible = 'Y';
    }
    this.setData({
      ['subjectInfo.children']:children
    })
  },
  /**三级章节的checkbox事件 */
  checkboxThree:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let children = this.data.subjectInfo.children;
    children[currIndex].isTraineesVisible = (children[currIndex].isTraineesVisible == 'Y')?'N':'Y';

    // 判断 二级节点是否  选中
    let allnum = 0;
    let visinum = 0;
    let lastIndex = -1;
    for(let a=0;a<children.length;a++){
      if(children[a].parentId == children[currIndex].parentId){
        allnum ++;
        if(children[a].isTraineesVisible && children[a].isTraineesVisible == 'Y'){
          visinum++;
        }
      }
      if(children[a].chapterId == children[currIndex].parentId){
        lastIndex = a;
      }
    }
    if(allnum >0 && visinum >=1 && lastIndex >-1){
      children[lastIndex].isTraineesVisible = 'Y';
    }
    // 判断 一级节点是否  选中
    let allnum2 = 0;
    let visinum2 = 0;
    let lastIndex2 = -1;
    for(let a=0;a<children.length;a++){
      if(children[a].parentId == children[lastIndex].parentId){
        allnum2 ++;
        if(children[a].isTraineesVisible && children[a].isTraineesVisible == 'Y'){
          visinum2++;
        }
      }
      if(children[a].chapterId == children[lastIndex].parentId){
        lastIndex2 = a;
      }
    }
    if(allnum2 >0 && visinum2 >=1 && lastIndex2 >-1){
      children[lastIndex2].isTraineesVisible = 'Y';
    }

    this.setData({
      ['subjectInfo.children']:children
    })
  },
  /**章节收缩 */
  toFoldChapter:function(event) {
    let currIndex = event.currentTarget.dataset.currindex;
    let currList = this.data.subjectInfo.children[currIndex];

    this.TapSingleChapter(currList,currIndex,currList.isFolder);
  },
  /**输入框 input事件 */
  bindinput:function (event) {
    this.data.chapterName = event.detail.value;
    this.setData({
      chapterName:this.data.chapterName
    })
    // this.findChapterList();
  },
  /**点击搜索  进行模糊查询 */
  searchInput:function () {
    this.findChapterList();
  },
  /**对章节进行处理，手风琴模块，同时只能打开一个 */
  TapSingleChapter:function(obj,index,isFolder){
    if(this.data.subjectInfo && this.data.subjectInfo.children && this.data.subjectInfo.children.length>0){
      let children = this.data.subjectInfo.children;
      let isFirst = false;
      for(let i=0;i<children.length;i++){
        children[i].show = false;
        children[i].isFolder = false;
      }
      children[index].isFolder = !isFolder
      children[index].show = true;
      for(let i=0;i<children.length;i++){
        if(children[i].parentId == obj.parentId){//同级
          children[i].show = true;
        }
        if(children[i].chapterId == obj.parentId){//上一级 父级
          children[i].show = true;
          children[i].isFolder = children[index].isFolder;
          for(let i2=0;i2<children.length;i2++){
            if(children[i2].parentId == children[i].parentId){//上一级 父级 的同级
              children[i2].show = true;
            }
          }
        }
      }
      for(let i2=0;i2<children.length;i2++){
        if(children[i2].parentId == children[index].chapterId){
          children[i2].show = children[index].isFolder;
          children[i2].isFolder = children[index].isFolder;
          for(let i3=0;i3<children.length;i3++){
            if(children[i3].parentId == children[i2].chapterId){
              children[i3].show = children[index].isFolder;
              children[i3].isFolder = children[index].isFolder;
            }
          }
        }
      }
      
      this.setData({
        ['subjectInfo.children']:children
      });
    }
  },
  /**获取 教材内容 章节列表数据*/
  findChapterList:function(){
    let that = this;
    that.data.noDataResIsShow = false;
    that.setData({
      noDataResIsShow:that.data.noDataResIsShow
    });
    let data = {
      subjectId:this.data.subjectId,
      chapterName:this.data.chapterName,
      activityType:this.data.classType,
      pkgId:this.data.pkgId,
      ctId:this.data.ctId,
    };
    core.request({
      url: "wx/resource-api/getBookTreeDataNew", // getBookTreeDataNew
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          that.data.subjectInfo = {};
          if(core.stringUtil.objectIsNotNull(res.data.data) ){
            let children = res.data.data.children
            if(children && children.length>0){
              that.data.chapterTreeList = [];
              for(let a=0;a<children.length;a++){
                children[a].isTraineesVisibleOld = (children[a].isTraineesVisible)?(children[a].isTraineesVisible):'N';
                children[a].show = false;
                children[a].isFolder = false;
                
                children[a].children = [];
                if(children[a].level == 1){  /// && children[a].level == 1
                  that.data.chapterTreeList.push(children[a]);
                }
              }
              // 将数据变成树形结构
              for(let a=0;a<children.length;a++){
                if(children[a].level == 2 ){
                  let treeList = that.data.chapterTreeList;
                  for(let t=0; t<treeList.length; t++){
                    if(children[a].parentId == treeList[t].chapterId){
                      treeList[t].children.push(children[a]);
                    }
                  }
                }
              }
              for(let a=0;a<children.length;a++){
                if(children[a].level == 3 ){
                  let treeList = that.data.chapterTreeList;
                  for(let t=0; t<treeList.length; t++){
                    let treeList2 = treeList[t].children;
                    for(let t2=0; t2<treeList2.length; t2++){
                      if(children[a].parentId == treeList2[t2].chapterId){
                        treeList2[t2].children.push(children[a]);
                      }
                    }
                  }
                }
              }
             
            }

            that.data.subjectInfo = Object.assign({},res.data.data);
            if(that.data.subjectInfo && that.data.subjectInfo.children && that.data.subjectInfo.children.length>0){
              that.TapSingleChapter(that.data.subjectInfo.children[0],0,false);
            }
            if(that.data.subjectInfo.subjectName){//动态设置当前页面的标题
              wx.setNavigationBarTitle({
                title: that.data.subjectInfo.subjectName
              })
            }
          }
          that.setData({
            subjectInfo:that.data.subjectInfo,
            chapterTreeList:that.data.chapterTreeList
          });
        }

        if(!that.data.subjectInfo || (that.data.subjectInfo && !that.data.subjectInfo.children) || (that.data.subjectInfo && that.data.subjectInfo.children && that.data.subjectInfo.children.length<1)){
          that.data.noDataResIsShow = true;
          that.setData({
            noDataResIsShow:that.data.noDataResIsShow
          });
        }
      },
      fail:function(){
        that.data.noDataResIsShow = true;
        that.setData({
          noDataResIsShow:that.data.noDataResIsShow
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取subjectId的值
    this.data.subjectId = (core.globalData.paramsData.subjectId) ? (core.globalData.paramsData.subjectId):'';

    this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';

    this.data.classType = (core.globalData.paramsData.classType) ? (core.globalData.paramsData.classType):'';

    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.classroomState =  (core.globalData.paramsData.classroomState) ? (core.globalData.paramsData.classroomState):'';

    this.data.onlyWatchActivityInfo = (core.globalData.paramsData.onlyWatchActivityInfo && core.globalData.paramsData.onlyWatchActivityInfo == 'true')?true:false;

    if(this.data.onlyWatchActivityInfo){
      this.data.containerBottom = 0;
      this.data.fixedBottom = 0;
      this.setData({
        containerBottom:this.data.containerBottom,
        fixedBottom:this.data.fixedBottom
      });
    }

    
    this.data.sourseFrom = (options && options.sourseFrom)?(options.sourseFrom):'';

    this.data.currActivityChapterId = (options && options.currActivityChapterId)?(options.currActivityChapterId):'';


    this.setData({
      subjectId:this.data.subjectId,
      pkgId:this.data.pkgId,
      ctId:this.data.ctId,
      classroomState:this.data.classroomState,
      classType:this.data.classType,
      onlyWatchActivityInfo:this.data.onlyWatchActivityInfo,
      sourseFrom:this.data.sourseFrom,
      currActivityChapterId:this.data.currActivityChapterId
    })
    this.findChapterList();

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
    if (!this.data.sourseFrom || this.data.sourseFrom !='setActivityChapter') {
      core.globalData.paramsData.chapterIdFromCha = '';
    }
    core.globalData.paramsData.setActivityChapterData = {};
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
  //跳转章节详情页面
  toZjContent: function (event) {
    let chapterId = event.currentTarget.dataset.chapterid 
    wx.navigateTo({
      url: '/pages/other/zjcontent/zjcontent?chapterId='+chapterId
    })
  }
})