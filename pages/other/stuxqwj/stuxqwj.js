// pages/other/stuxqwj/stuxqwj.js
const app = getApp();
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityInfo:{},//活动信息
    ctId:'',//课堂id
    traineeId:'',//学员id
    result:[],//学员提交的结果
    scrollTntoView:'',//当前滚动到的位置
    hasBeenDone:false,//是否提交
    actionSheetHidden:true,//是否隐藏 上传图片、视频等 action-sheet
    actionSheetData:{},//页脚 等需要的参数
    actionSheetFileLabelArr:[
      {label:'上传图片',type:'image',url:'iconimageupload',color:'#1296db'},
      {label:'上传视频',type:'video',url:'icondianjishangchuanshipin',color:'#ff794f'},
      {label:'上传其他',type:'file',url:'iconshangchuanwenjian',color:'#0485e8'}
    ],//上传附件 的页脚的列表数据
    currEditActivity:{},//上一个页面传的参数
    isShowVideo:false,//是否显示video
    videoSrc:'',//视频的src
    containerBottom:core.globalData.containerBottom,//底部导航栏的高度
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
  },
  /** 可填写 选项 的 内容 输入 */
  canFillInput:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let preIndex = event.currentTarget.dataset.preindex;

    this.data.result[preIndex].fillList[currIndex].content =  event.detail.value;
    this.setData({
      ['result['+preIndex+'].fillList['+currIndex+'].content']:this.data.result[preIndex].fillList[currIndex].content
    });
  },
  /**取消 */
   cancel:function(){
    wx.navigateBack();
  },
  /**点击附件 进行预览 */
  toClickFile:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let preIndex = event.currentTarget.dataset.preindex;
    let currObj = this.data.result[preIndex].fileTempFiles[currIndex];
    if(currObj.type == 'image'){
      //去预览图片 
      let arr = []// 需要预览的图片http链接列表
      arr.push(currObj.path)
      core.service.previewImage(arr, function () { })
    }else if(currObj.type == 'video'){
      if(this.data.result && this.data.result.length>0){
        let result = this.data.result;
        for(let a=0;a<result.length;a++){
          if(result[a] && result[a].fileTempFiles && result[a].fileTempFiles.length>0){
            let fileTempFiles = result[a].fileTempFiles;
            for(let a1=0;a1<fileTempFiles.length;a1++){
              var videoContext = wx.createVideoContext('msgvideo'+a1,this);
              videoContext.pause();
            }
          }
        }
      }
      if(currObj.path){
        this.data.isShowVideo = true
        this.data.videoSrc = currObj.path
        let videoContext = wx.createVideoContext('myvideo',this)
        videoContext.requestFullScreen();
        // videoContext.play();
  
        setTimeout(function(){
          videoContext.play();
        },1000)
        
        this.setData({
          isShowVideo: this.data.isShowVideo,
          videoSrc: this.data.videoSrc
        })
      }
    }else {
      //去查看文件 
      core.service.downLoadAndLookFile(currObj.path);
    }
  },
  /**视频播放出错 */
  videoError:function(event){
    if(event && event.detail && event.detail.errMsg){
      core.dialogUtil.showToast({title:'视频播放出错：'+event.detail.errMsg});
    }else{
      core.dialogUtil.showToast({title:'视频播放出错'});
    }
  },
  /**监听视频全屏事件 */
  videoFullScreenChange:function(e){
    if (!e.detail.fullScreen){
      this.data.isShowVideo = false
      let videoContext = wx.createVideoContext('myvideo', this)
      videoContext.exitFullScreen();
      videoContext.stop();
      this.data.videoSrc = ''
      this.setData({
        isShowVideo: this.data.isShowVideo,
        videoSrc: this.data.videoSrc
      })
    }else{
    }
  },
  /**去提交 */
  toSave:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      activityId:this.data.activityInfo.activityId,
    };
    //对提交的数据进行验证
    if(this.data.result && this.data.result.length>0){
      let result = this.data.result;
      for(let a=0;a<result.length;a++){
        if(result[a].questionType == '1' || result[a].questionType == '2'){
          if(!(core.stringUtil.trim(result[a].optionIds)) ){
            this.data.scrollTntoView = 'question'+a;
            this.setData({
              scrollTntoView:this.data.scrollTntoView 
            });
            core.dialogUtil.showToast({title:'当前题目【'+ this.data.activityInfo.questionList[a].questionName +'】选项不能为空，请选择选项'});
            return false;
          }
        }
        if(result[a].questionType == '3'){
          if(!(core.stringUtil.trim(result[a].content)) ){
            this.data.scrollTntoView = 'question'+a;
            this.setData({
              scrollTntoView:this.data.scrollTntoView 
            });
            core.dialogUtil.showToast({title:'当前题目【'+ this.data.activityInfo.questionList[a].questionName +'】内容不能为空，请填写内容'});
            return false;
          }
        }
      }
    }else{
      this.data.scrollTntoView = 'question0';
      this.setData({
        scrollTntoView:this.data.scrollTntoView 
      });
      core.dialogUtil.showToast({title:'请填写问卷'})
      return false;
    }
    data.json = JSON.stringify(that.data.result);
    core.dialogUtil.showModal({content:'确定提交吗？'},function() {
      core.request({
        url: "wx/activity-api/voteQuestionnaire/saveTraineeCommitAnswerContent?token="+core.globalData.userInfo.token,
        method: "POST",
        header: {
          'content-type': 'application/json' // 默认值
        },
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg,mask:'true'})
            }
            if(that.data.activityInfo && that.data.activityInfo.isShow && that.data.activityInfo.isShow == 'Y'){//老师选择了“投票后立即显示结果”
              setTimeout(function(){
                wx.redirectTo({
                  url: '/pages/other/xqwj/xqwj',
                })
              },core.globalData.operState.duration);
            }else{
              core.service.backPageOnload();
            }
          }
        }
      });
    },function() {});
    
  },
  /**单选题的选择radio change事件 */
  radioChange:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.result[currIndex].optionIds = '';//清空当前题目的选择
    let chilIndex = event.detail.value;
    this.data.result[currIndex].optionIds =this.data.activityInfo.questionList[currIndex].children[chilIndex].optionId;
    this.setData({
      ['result['+currIndex+'].optionIds']:this.data.result[currIndex].optionIds
    });
  },
  /**多选题的选择checkbox change事件 */
  checkboxChange:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.result[currIndex].optionIds = '';//清空当前题目的选择

    if (this.data.activityInfo.questionList[currIndex].children && this.data.activityInfo.questionList[currIndex].children.length > 0) {
      this.data.activityInfo.questionList[currIndex].children.forEach((itemc, indexc) => {
        itemc.isChecked = false;
      });
    }
    let chilIndexList = event.detail.value;
    if(chilIndexList && chilIndexList.length>0){
      for(let a=0;a<chilIndexList.length;a++){
        this.data.activityInfo.questionList[currIndex].children[chilIndexList[a]].isChecked = true;

        this.data.result[currIndex].optionIds += this.data.activityInfo.questionList[currIndex].children[chilIndexList[a]].optionId;
        if(a < (chilIndexList.length-1)){
          this.data.result[currIndex].optionIds += ',';
        }
      }
    }
    this.setData({
      ['activityInfo.questionList['+currIndex+'].children']: this.data.activityInfo.questionList[currIndex].children,
      ['result['+currIndex+'].optionIds']:this.data.result[currIndex].optionIds
    });
  },
  /**简答 题的 textarea input事件 */
  textareaInput:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.result[currIndex].content = event.detail.value;//清空当前题目的选择
    this.setData({
      ['result['+currIndex+'].content']:this.data.result[currIndex].content
    });
  },
  /**上传附件 的 删除 的选择checkbox change事件 */
  checkboxFileChange:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let fileTempFiles = this.data.result[currIndex].fileTempFiles;
    if(fileTempFiles && fileTempFiles.length>0){
      for(let a=0;a<fileTempFiles.length;a++){
        fileTempFiles[a].isChecked = false;
      }
    }
    let valueList = event.detail.value;
    if(valueList && valueList.length>0){
      for(let a=0;a<valueList.length;a++){
        fileTempFiles[valueList[a]].isChecked = true;
      }
    }
    this.setData({
      ['result['+currIndex+'].fileTempFiles']:fileTempFiles
    })
  },
  /**显示页脚 上传图片、视频等 选项*/
  actionSheetTap:function(event){
    let type = event.currentTarget.dataset.type;
    this.data.actionSheetData = {};
    if(type == 'show'){
      this.data.actionSheetData.type = type;
      let currIndex = event.currentTarget.dataset.currindex;
      if(currIndex || currIndex==0){
        this.data.actionSheetData.currIndex = currIndex;
      }
      if(this.data.result[currIndex].fileTempFiles && this.data.result[currIndex].fileTempFiles.length>=30){
        core.dialogUtil.showToast({title:'最多可上传30个附件'});
        return false;
      }
    }
    this.setData({
      actionSheetData:this.data.actionSheetData,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  /**添加附件 */
  toAddFile:function(event){
    this.setData({
      actionSheetHidden: true
    })
    let currIndex = (event.currentTarget.dataset.currindex || event.currentTarget.dataset.currindex==0)?( event.currentTarget.dataset.currindex):(this.data.actionSheetData.currIndex);
    let type = (event.currentTarget.dataset.type)?( event.currentTarget.dataset.type):(this.data.actionSheetData.type);
    let that = this;
    core.service.activityUploadFile({funType:type,url:'wx/activity-api/voteQuestionnaire/upload'},function(suc){
      suc.chooseMessageFileData.isChecked = false;
      if(that.data.result[currIndex].fileTempFiles && that.data.result[currIndex].fileTempFiles.length>=30){
        core.dialogUtil.showToast({title:'最多可上传30个附件'});
        return false;
      }else{
        that.data.result[currIndex].fileTempFiles.push(suc.chooseMessageFileData);
        that.data.result[currIndex].fileList.push(( (suc.backstageData.attachId)?(suc.backstageData.attachId):'' ));
        that.setData({
          ['result['+currIndex+'].fileTempFiles']:that.data.result[currIndex].fileTempFiles,
          ['result['+currIndex+'].fileList']:that.data.result[currIndex].fileList
        })
      }

      
    });
  },
  /**删除附件操作 */
  doDel:function(event){
    let that = this;
    let currIndex = event.currentTarget.dataset.currindex;
    let fileTempFiles = this.data.result[currIndex].fileTempFiles;
    let fileList = this.data.result[currIndex].fileList;
    core.dialogUtil.showModal({content:'确定删除吗？'},function() {
      if(fileTempFiles && fileTempFiles.length>0){
        for(let a=(fileTempFiles.length-1);a>=0;a--){
          if(fileTempFiles[a].isChecked){
            fileTempFiles.splice(a,1);
            fileList.splice(a,1);
          }
        }
        that.setData({
          ['result['+currIndex+'].fileTempFiles']:fileTempFiles,
          ['result['+currIndex+'].fileList']:fileList
        })
      }
    },function() {});
  },
  /**切换 上传附件的  编辑 与取消 */
  toChangeIsEdit:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.activityInfo.questionList[currIndex].isEditFile = !(this.data.activityInfo.questionList[currIndex].isEditFile);

    let fileTempFiles = this.data.result[currIndex].fileTempFiles;
    if(fileTempFiles && fileTempFiles.length>0){
      for(let a=0;a<fileTempFiles.length;a++){
        fileTempFiles[a].isChecked = false;
      }
    }
    this.setData({
      ['activityInfo.questionList['+currIndex+'].isEditFile']:this.data.activityInfo.questionList[currIndex].isEditFile,
      ['result['+currIndex+'].fileTempFiles']:fileTempFiles
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    
    this.data.ctId = ( options && options.ctId)?(options.ctId): ( (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'' ) ;
    this.data.traineeId = ( options && options.traineeId)?(options.traineeId):'' ;
    
    this.data.currEditActivity = ( options && options.currEditActivity && core.stringUtil.objectIsNotNull(JSON.parse(options.currEditActivity)))?(JSON.parse(options.currEditActivity)): ( (core.globalData.paramsData.currEditActivity && core.stringUtil.objectIsNotNull(core.globalData.paramsData.currEditActivity) ) ? (core.globalData.paramsData.currEditActivity):{} )
    this.setData({
      ctId:this.data.ctId,
      traineeId:this.data.traineeId,
      currEditActivity:this.data.currEditActivity
    })

    

    this.data.hasBeenDone = false;
    if(core.stringUtil.objectIsNotNull(this.data.currEditActivity) && (this.data.currEditActivity.hasBeenDone)){
      this.data.hasBeenDone = true;
      // this.viewTraineeAnswerInfo();
    }
    this.setData({
      hasBeenDone:this.data.hasBeenDone
    });

    this.viewActivityInfo();

  },
  /**获取活动的题目等信息*/
  viewActivityInfo:function(){
    let that = this;
    if(core.stringUtil.objectIsNotNull(this.data.currEditActivity)){
      let data = {
        activityId:this.data.currEditActivity.activityId,
        activityType:this.data.currEditActivity.activityType
      };
      if(!data.activityId){
        return false;
      } 
      core.request({
        url: "wx/activity-api/viewActivityInfo",
        method: "GET",
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            that.data.activityInfo = {};
            that.data.result = [];
            if(core.stringUtil.objectIsNotNull(res.data.data)){
              that.data.activityInfo = res.data.data;
              if(that.data.activityInfo.questionList && that.data.activityInfo.questionList.length>0 ){
                let questionList = that.data.activityInfo.questionList;
                for(let a=0;a<questionList.length;a++){
                  questionList[a].isEditFile = false;//是否编辑附件
                  let fillList = [];
                  if (questionList[a].children && questionList[a].children.length >0 ) {
                    questionList[a].children.forEach((itema, indexa) => {
                      fillList.push({
                        optionId: itema.optionId,
                        content: ''
                      });
                    });
                  }

                  that.data.result.push({
                    questionId:questionList[a].questionId,
                    questionType:questionList[a].questionType,
                    optionIds:'',//如果单选或者多选，必传
                    content:'',//如果简答，必传
                    fileList:[],//附件
                    fileTempFiles:[],//临时文件
                    fillList: fillList,//选项可以填写 的  作答 数组
                  });
                }
              }
            }
            that.setData({
              activityInfo:that.data.activityInfo,
              result:that.data.result
            })
            if(that.data.hasBeenDone){
              that.viewTraineeAnswerInfo();
            }

          }
        }
      });
    }
  },
   /**获取学生的回答 */
   viewTraineeAnswerInfo:function(){
    let that = this;
    if(core.stringUtil.objectIsNotNull(this.data.currEditActivity)){
      let data = {
        ctId:this.data.ctId, 
        // anId:this.data.anId,
        activityId:this.data.currEditActivity.activityId,
        traineeId:this.data.traineeId,
      };
      if(!data.activityId){
        return false;
      } 
      core.request({
        url: "wx/activity-api/voteQuestionnaire/viewTraineeAnswerData",
        method: "POST",
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.data && res.data.data.length>0){
              let data = res.data.data;
              for(let a=0;a<data.length;a++){
                if(that.data.activityInfo && that.data.activityInfo.questionList &&  that.data.activityInfo.questionList.length>0){
                  let questionList = that.data.activityInfo.questionList;
                  for(let i=0;i<questionList.length;i++){
                    if(data[a].questionId == questionList[i].questionId){
                      if(data[a].questionType == '2'){
                        if(data[a].traineeSelectList && data[a].traineeSelectList.length>0 && questionList[i].children && questionList[i].children.length>0){
                          let traineeSelectList = data[a].traineeSelectList ;
                          let children = questionList[i].children;
                          for(let i2 = 0;i2 < traineeSelectList.length;i2++){
                            for(let i3 = 0;i3 < children.length;i3++){
                              if(traineeSelectList[i2] == children[i3].optionId){
                                children[i3].isChecked = true;
                                that.setData({
                                  ['activityInfo.questionList['+i+'].children['+i3+'].isChecked']:children[i3].isChecked
                                });
                                break;
                              }
                            }
                          }
                        }
                      }
                      if(data[a].questionType != '3'){
                        that.data.result[i].optionIds = ( (data[a].traineeSelectList && data[a].traineeSelectList.length>0)?(data[a].traineeSelectList.join(',')):'' );

                        if (data[a].children && data[a].children.length > 0 && questionList[i].children && questionList[i].children.length > 0  ) {
                          let childrenq = questionList[i].children;
                          let childrend = data[a].children;
                          for(let d=0;d< childrend.length;d++) {
                            for(let q=0;q< childrenq.length;q++) {
                              if (childrend[d].optionId == childrenq[q].optionId) {
                                that.data.result[i].fillList[q].content = childrend[d].content;
                                break;
                              }
                            }
                          }
                        }
                        


                      }else{
                        that.data.result[i].content = (data[a].traineeAnswerData && data[a].traineeAnswerData.content)?(data[a].traineeAnswerData.content):'';
                        if(data[a].traineeAnswerData && data[a].traineeAnswerData.fileList && data[a].traineeAnswerData.fileList.length>0){
                          let fileList = data[a].traineeAnswerData.fileList ;
                          for(let a2=0;a2<fileList.length;a2++){
                            that.data.result[i].fileTempFiles.push({
                              type:fileList[a2].fileType,
                              name:(fileList[a2].originalFilename)?(fileList[a2].originalFilename):'',
                              path:core.concatImgUrl(fileList[a2].url),
                              pathPic:core.concatImgUrl(fileList[a2].firstCaptureAccessUrl),
                              isChecked:false
                            });
                          }
                          
                        }
                      }
                      // that.data.result[i] = obj;
                      break;
                    }
                  }
                }
              }
              that.setData({
                result:that.data.result
              })
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