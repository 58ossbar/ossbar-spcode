// pages/course/createkc/createkc.js
const app = getApp();
const core = require("../../../utils/core/core.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataForm:{
      name:'',//课堂名称
      majorId: '',//职业路径ID
      subjectId:'',//课程ID
      pkgId:'',//教学包id
      attachId:'',//图片ID
      classId:'',//班级ID
      pic:'',//图片路径
      intro:'',//课程简介
      isCheck:'N',//是否审核
      isPublic:'N',//是否是公开课
      ifLiveLesson:'N',//是否是直播课
      linkUrl: '', // 直播地址
      classList:[],//班级信息
    },//表单数据项
    tempFilePath:'',
    ctId:'',//课堂id
    majorList:[],//职业路径：职业路径列表
    majorIndex:0,//当前被选中的 职业路径：职业路径列表 的下标
    subjectList:[],//课程名称列表
    subjectIndex:0,//当前被选中的 课程名称列表 的下标
    pkgList:[],//教学包列表
    pkgIndex:-1,//当前被选中的 教学包列表 的下标
    classList:[],//班级列表
    classIndex:[],//当前被选中的 班级列表 的下标
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
    classroomInfo:{},//编辑时的课堂信息
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    isCanEdit:false,//编辑时职业路径等 是否是编辑状态
  },
  /**删除已选择的班级 */
  toDelClassId:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let classIdList = this.data.dataForm.classId.split(',');
    classIdList.splice(currIndex,1);
    this.data.dataForm.classId = (classIdList && classIdList.length>0)?( classIdList.join(',')):'';
    this.data.classIndex.splice(currIndex,1);
    this.setData({
      ['dataForm.classId']:this.data.dataForm.classId,
      classIndex:this.data.classIndex
    })
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
      this.data.dataForm[name+'Id'] = (event.detail.idList && event.detail.idList.length>0)?( (name == 'class')?(event.detail.idList.join(',')):(event.detail.idList[0]) ):''; 
      this.data[name+'Index'] = (event.detail.indexList)?( event.detail.indexList ):[]; 
      this.setData({
        ['dataForm.'+name+'Id']:this.data.dataForm[name+'Id'],
        [name+'Index']:this.data[name+'Index']
      })
      if(name == 'major'){//根据职业路径查询课程名称
        this.data.subjectList = [];
        this.data.subjectIndex = 0;
        this.data.dataForm.subjectId = '';
        this.data.classList = [];
        this.data.classIndex = 0;
        this.data.dataForm.classId = '';
        this.setData({
          subjectList:this.data.subjectList,
          subjectIndex:this.data.subjectIndex,
          ['dataForm.subjectId']:this.data.dataForm.subjectId,
          classList:this.data.classList,
          classIndex:this.data.classIndex,
          ['dataForm.classId']:this.data.dataForm.classId 
        })
        this.findSubjectList();
        this.findClassList();
      }
      if(name == 'subject'){//根据职业路径和课程名称查询教学包
        this.data.pkgList = [];
        this.data.pkgIndex = -1;
        this.data.dataForm.pkgId = '';
        this.setData({
          pkgList:this.data.pkgList,
          pkgIndex:this.data.pkgIndex,
          ['dataForm.pkgId']:this.data.dataForm.pkgId 
        })
        this.findPkgList();
      }
      
    }else if(event.detail.type == 'cancel'){//点击取消

    }
  },
  /**添加教学包 */
  toAddPkg:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择教学包';
    this.data.pickerDatas.listDataPicker = this.data.pkgList;
    let pkgId  = (this.data.dataForm.pkgId)?(this.data.dataForm.pkgId):( (this.data.pkgList && this.data.pkgList[0] && this.data.pkgList[0].pkgId)?(this.data.pkgList[0].pkgId):'' ); 
    this.data.pickerDatas.defaultDataPicker = (pkgId)?( (pkgId).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'pkgName';
    this.data.pickerDatas.keyIdOfShowPicker = 'pkgId';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**添加职业路径 */
  toAddMajor:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择职业路径';
    this.data.pickerDatas.listDataPicker = this.data.majorList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.majorId)?( (this.data.dataForm.majorId).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'majorName';
    this.data.pickerDatas.keyIdOfShowPicker = 'majorId';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**添加课程名称 */
  toAddSubject:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'picker_radio';
    this.data.pickerDatas.titlePicker = '请选择课程名称';
    this.data.pickerDatas.listDataPicker = this.data.subjectList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.subjectId)?( (this.data.dataForm.subjectId).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'subjectName';
    this.data.pickerDatas.keyIdOfShowPicker = 'subjectId';
    this.setData({
      pickerDatas:this.data.pickerDatas
    })
  },
  /**添加班级 */
  toAddClass:function(event){
    this.data.pickerDatas.namePicker = event.currentTarget.dataset.name;
    this.data.pickerDatas.isShowPicker = true;
    this.data.pickerDatas.typePicker = 'checkbox';
    if(this.data.ctId){
      this.data.pickerDatas.typePicker = 'picker_radio';
    }
    this.data.pickerDatas.titlePicker = '请选择班级';
    this.data.pickerDatas.listDataPicker = this.data.classList;
    this.data.pickerDatas.defaultDataPicker = (this.data.dataForm.classId)?( (this.data.dataForm.classId).split(',') ):'';
    this.data.pickerDatas.keyWordOfShowPicker = 'className';
    this.data.pickerDatas.keyIdOfShowPicker = 'classId';
    this.setData({
      pickerDatas:this.data.pickerDatas
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
  /**获取课堂信息 */
  viewClassRoom:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId
    };
    if(!data.ctId){
      return false;
    }
    wx.setNavigationBarTitle({//动态设置当前页面的标题
      title: '编辑课堂'
    })
    core.request({
      url: "wx/classroom-api/viewClassroomInfo",
      method: "GET",
      data:data,
      success: function (res) {
        if (res.data.code === 0) {
          if(core.stringUtil.objectIsNotNull(res.data.data)){
            let ss = res.data.data;
            that.data.classroomInfo = ss;
            that.data.dataForm.name = (ss.name) ? ss.name :'';
            that.data.dataForm.majorId = (ss.majorId) ? ss.majorId :'';
            that.data.dataForm.subjectId = (ss.subjectId) ? ss.subjectId :'';
            // that.data.dataForm.pkgId = (ss.refPkgId) ? ss.refPkgId :'';
            that.data.dataForm.pkgId = (ss.pkgId) ? ss.pkgId :'';
            that.data.dataForm.attachId = (ss.attachId) ? ss.attachId :'';
            let picArr = (ss.pic) ? (ss.pic.split('/')) :[]
            that.data.dataForm.pic = (picArr && picArr[picArr.length-1]) ? (picArr[picArr.length-1]) :'';
            that.data.tempFilePath = core.concatImgUrl(ss.pic);
            that.data.dataForm.classId = (ss.classId) ? ss.classId :'';
            that.data.dataForm.intro = (ss.intro) ? ss.intro :'';
            that.data.dataForm.isCheck = (ss.isCheck) ? ss.isCheck :'N';
            that.data.dataForm.isPublic = (ss.isPublic) ? ss.isPublic :'N';
            that.data.dataForm.ifLiveLesson = (ss.ifLiveLesson) ? ss.ifLiveLesson :'N';
            that.data.dataForm.linkUrl = (ss.linkUrl) ? ss.linkUrl :'';
            
            that.setData({
              classroomInfo:that.data.classroomInfo,
              dataForm:that.data.dataForm,
              tempFilePath:that.data.tempFilePath,
            })
            
            that.findMajorList();
          }
        }
      }
    });
  },
  /**职业路径 */
  findMajorList:function(){
    let that = this;
    core.request({
      url: "wx/classroom-api/getAllBookMajorList",
      method: "GET",
      success: function (res) {
        if (res.data.code === 0) {
          that.data.majorList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.dataForm.majorId) && ( res.data.data[i].majorId == that.data.dataForm.majorId )){
                that.data.majorIndex = i;
                break;
              }
            }
            that.data.majorList = res.data.data;
            if(!that.data.dataForm.majorId){
              that.data.dataForm.majorId = that.data.majorList[0].majorId;
              that.data.majorIndex = 0;
            }
          }
          that.setData({
            majorIndex: that.data.majorIndex,
            ['dataForm.majorId']: that.data.dataForm.majorId,
            majorList: that.data.majorList
          })
          that.findSubjectList();
          that.findClassList();
        }
      }
    });
  },
  //课程列表
  findSubjectList:function(){
    let that = this;
    core.request({
      url: "wx/classroom-api/getAllBookSubjectList",
      method: "GET",
      data: {
        majorId: that.data.dataForm.majorId
      },
      success: function (res) {
        if (res.data.code === 0) {
          that.data.subjectList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.dataForm.subjectId) && ( res.data.data[i].subjectId == that.data.dataForm.subjectId )){
                that.data.subjectIndex = i;
                break;
              }
            }
            that.data.subjectList = res.data.data;
            if(!that.data.dataForm.subjectId){
              that.data.dataForm.subjectId = that.data.subjectList[0].subjectId;
              that.data.subjectIndex = 0;
            }
          }
          that.setData({
            subjectIndex: that.data.subjectIndex,
            ['dataForm.subjectId']: that.data.dataForm.subjectId,
            subjectList: that.data.subjectList
          })
          that.findPkgList();
        }
      }
    });
  },
  //教学包
  findPkgList:function(){
    let that = this;
    let data = {
      majorId: that.data.dataForm.majorId,
      subjectRef: that.data.dataForm.subjectId
    };
    if(that.data.ctId){
      data.ctId = that.data.ctId;
    }
    core.request({
      url: "wx/pkg-api/listPkgInfoSelect",
      method: "GET",
      data: data,
      success: function (res) {
        if (res.data.code === 0) {
          that.data.pkgList = [];
          if(res.data.data && res.data.data.length>0){
            for (let i = 0; i < res.data.data.length; i++) {
              if((that.data.dataForm.pkgId) && ( res.data.data[i].pkgId == that.data.dataForm.pkgId )){
                that.data.pkgIndex = i;
                break;
              }
            }
            that.data.pkgList = res.data.data;
            if(!that.data.dataForm.pkgId){
              // that.data.dataForm.pkgId = that.data.pkgList[0].pkgId;
              that.data.pkgIndex = -1;
            }
          }
          that.setData({
            pkgList: that.data.pkgList,
            ['dataForm.pkgId']: that.data.dataForm.pkgId,
            pkgIndex: that.data.pkgIndex
          })
        }
      }
    });
  },
  //班级列表
  findClassList:function(){
    let that = this;
    let data = {
      majorId: that.data.dataForm.majorId
    };
    core.request({
      url: "wx/classroom-api/getAllClassList",
      method: "GET",
      data:data,
      success: function (res) {
        if (res.data.code === 0) {
          that.data.classList = [];
          that.data.classIndex = [];
          if(res.data.data && res.data.data.length>0){
            let classIdList = (that.data.dataForm.classId)?( (that.data.dataForm.classId).split(',') ):[];
            for (let i = 0; i < res.data.data.length; i++) {
              if(classIdList && classIdList.length>0){
                for(let a=0;a<classIdList.length;a++){
                  if(res.data.data[i].classId == classIdList[a]){
                    that.data.classIndex.push(i);
                    break;
                  }
                }
              }
              // if((that.data.dataForm.classId) && ( res.data.data[i].classId == that.data.dataForm.classId )){
              //   that.data.classIndex = i;
              //   break;
              // }
            }
            that.data.classList = res.data.data;
            // if(!that.data.dataForm.classId){
            //   that.data.dataForm.classId = that.data.classList[0].classId;
            //   that.data.classIndex = 0;
            // }
          }
          that.setData({
            classIndex: that.data.classIndex,
            ['dataForm.classId']: that.data.dataForm.classId,
            classList: that.data.classList
          })
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';
    this.setData({
      ctId:this.data.ctId
    })
    if(core.globalData.paramsData.ctId){
      this.viewClassRoom();
    }else{
      this.findMajorList();
    }
  },
  //监听是否审核
  switchChange:function(e){
    let name = e.currentTarget.dataset.name;
    this.data.dataForm[name] = (e.detail.value)?'Y':'N';
    this.setData({
      ['dataForm.'+name]:this.data.dataForm[name]
    });
  },
  //创建课堂
  saveClass: function() {
    let that = this;
    let data = {
      ctId:that.data.ctId,
    };
    data = Object.assign(data,this.data.dataForm);
    if(!(core.stringUtil.trim(data.name)) ){
      core.dialogUtil.showToast({title:'课堂名称不能为空，请输入课堂名称'})
      return false;
    }
    if(!(core.stringUtil.trim(data.majorId)) ){
      core.dialogUtil.showToast({title:'职业路径不能为空，请选择职业路径'})
      return false;
    }
    if(!(core.stringUtil.trim(data.subjectId)) ){
      core.dialogUtil.showToast({title:'课程名称不能为空，请选择课程名称'})
      return false;
    }
    if(!(core.stringUtil.trim(data.pic)) ){
      core.dialogUtil.showToast({title:'课堂封面不能为空，请上传课堂封面'})
      return false;
    }
    if(!(core.stringUtil.trim(data.classId)) ){
      core.dialogUtil.showToast({title:'班级不能为空，请添加班级'})
      return false;
    }
    if (data.ifLiveLesson && data.ifLiveLesson == 'Y') {
      if(!( core.validateUtil.checkNetworkAddress('直播地址',data.linkUrl,true) ) ){
        return false;
      }
    } else {
      data.linkUrl = ''
    }
    core.dialogUtil.showModal({content:'确定保存吗？'},function() {
      core.request({
        url: "wx/classroom-api/saveOrUpdateClassroom",
        data:data,
        success: function(res) {
          if (res.data.code === 0) {
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            if(core.globalData.paramsData.isFromCourseList && core.globalData.paramsData.isFromCourseList == 'true'){
              wx.reLaunch({
                url: '/pages/tabbar/courselist/courselist',
              })
            }else{
              wx.reLaunch({
                url: '/pages/tabbar/home/home',
              })
            }
          }
        }
      });
    },function() {});
  },
  /**取消按钮 */
  backClass:function(e){
    wx.navigateBack();
  },
  //选择本地图片
  changeImg: function() {
    let that = this;
    core.chooseImage({
      count:1,
      success(res){
        that.data.tempFilePath = res.tempFilePaths[0]
        core.uploadFile({
          url:'wx/classroom-api/uploadPic',
          filePath: that.data.tempFilePath,
          success: function (res2) {
            let res2data = typeof (res2.data) == 'string' ? JSON.parse(res2.data) :(res2.data)
            if (res2data.code === 0) {
              that.setData({
                tempFilePath: that.data.tempFilePath,
                ['dataForm.attachId']: res2data.data.attachId,
                ['dataForm.pic']:res2data.data.imgNamePc
              })
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})