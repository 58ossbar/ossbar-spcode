
// pages/other/member/member.js
const app = getApp();
const core = require("../../../utils/core/core.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    popupBox:true,
    memberList:[],//成员数组
    ctId:'',//课堂id
    classInfo:{},//班级信息
    requestPage: {
      pageNum: 1,//当前第几页
      pageSize: 10//每页多少条
    },//成员数组 页面 数据
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    settingHidden:true,//删除、审核等成员设置 是否显示
    currTrainee:{},//当前选中 的学员数据
    settingList:[
      {iconName:'icondelete',iconSize:'44',name:'移出课堂',isShow:true},
      {iconName:'iconshenhe',iconSize:'44',name:'审核',isShow:true}
    ],//删除、审核等成员设置 列表数据
    settingSheetHidden:true,// 设置权限、云盘等  下拉 选择 是否隐藏
    isShowChaVis:false,//是否显示复选框
    isCheckedAll:false,//是否全选 复选框
    traineeName:'',//搜索框的值
    classroomState:'',//课堂的状态
    addMemberPerms: false,// 是否有 【添加成员】  的 权限
    delMemberPerms: false,// 是否有 【将成员移出课堂】  的 权限
    checkingMemberPerms: false,// 是否有 【审批成员】  的 权限
    editInfoMemberPerms: false,// 是否有 【修改成员信息】  的 权限
    assistantingMemberPerms: false,// 是否有 【设助教】  的 权限
    scrollPermsNum:0,//成员 左滑 权限的 个数
  },
  /**预览图片 */
  toPreviewImage:function(){
    let urlArr = [];
    urlArr.push(this.data.classInfo.qrCode)
    core.service.previewImage(urlArr,function(){});
  },
  /**输入框 input事件 */
  bindinput:function (event) {
    this.data.traineeName = event.detail.value;
    this.setData({
      traineeName:this.data.traineeName
    })
  },
  /**点击搜索  进行模糊查询 */
  searchInput:function () {
    this.findMemberList(this.data.requestPage,false);
  },
  /**显示以及隐藏复选框 */
  tapCheckBoxVisible:function(){
    this.data.settingSheetHidden = true;
    this.setData({
      settingSheetHidden:this.data.settingSheetHidden
    })
    if (!this.data.memberList || this.data.memberList.length < 1) {
      core.dialogUtil.showToast({title: '当前课堂暂无成员，暂不能使用此功能，请先添加成员'});
      return false;
    }

    this.data.isShowChaVis = !(this.data.isShowChaVis)
    if(this.data.memberList && this.data.memberList.length>0){
      for(let i=0;i<this.data.memberList.length;i++){
        this.data.memberList[i].isChecked = false;
      }
    }
    this.data.isCheckedAll = false;
    this.setData({
      memberList:this.data.memberList,
      isCheckedAll:this.data.isCheckedAll,
      isShowChaVis:this.data.isShowChaVis
    })
  },
  /**全选以及取消全选 */
  checkAll:function(){
    if(this.data.memberList && this.data.memberList.length>0){
      this.data.isCheckedAll = !(this.data.isCheckedAll);
      for(let i=0;i<this.data.memberList.length;i++){
        this.data.memberList[i].isChecked =  this.data.isCheckedAll;
      }
      this.setData({
        isCheckedAll:this.data.isCheckedAll,
        memberList:this.data.memberList
      });
    }
  },
  /**复选框选择 */
  checkboxClick:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.memberList[currIndex].isChecked = !(this.data.memberList[currIndex].isChecked);

    this.data.isCheckedAll = false;
    let num = 0;
    if(this.data.memberList && this.data.memberList.length>0){
      for(let i=0;i<this.data.memberList.length;i++){
        if(this.data.memberList[i].isChecked){
          num++;
        }
      }
    }
    if(num == (this.data.memberList.length)){
      this.data.isCheckedAll = true;
    }
    this.setData({
      ['memberList['+currIndex+'].isChecked']:this.data.memberList[currIndex].isChecked,
      isCheckedAll:this.data.isCheckedAll
    });
  },
  /**显示或者隐藏 设置权限、云盘等  下拉 选择  */
  settingSheetTap:function(){
    this.data.settingSheetHidden = !(this.data.settingSheetHidden);
    this.setData({
      settingSheetHidden:this.data.settingSheetHidden
    });
  },
  /**触摸开始 */
  touchStart:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.memberList.forEach((item,index)=>{
      item.isTouchMove = false;
      item.startX = 0;
      item.startY = 0;
    })
    this.data.memberList[currIndex].startX = event.changedTouches[0].clientX;
    this.data.memberList[currIndex].startY = event.changedTouches[0].clientY;
    this.setData({
      memberList:this.data.memberList
    })
  },
  /**触摸 移动 */
  touchMove:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    //结束 坐标 - 开始坐标
    let moveX = event.changedTouches[0].clientX - this.data.memberList[currIndex].startX;
    let moveY = event.changedTouches[0].clientY - this.data.memberList[currIndex].startY;
    //返回角度 /Math.atan()返回数字的反正切值
    let angle = 360 * Math.atan(moveY / moveX) / (2 * Math.PI);
    if(Math.abs(angle) >30 ){//滑动超过30度
      return false;
    }
    if(event.changedTouches[0].clientX > this.data.memberList[currIndex].startX){//右滑
      this.data.memberList[currIndex].isTouchMove = false;
    }else {//左滑
      this.data.memberList[currIndex].isTouchMove = true;
    }
    this.setData({
      ['memberList['+currIndex+'].isTouchMove']:this.data.memberList[currIndex].isTouchMove
    })

  },
  /**操作  删除、审核等成员设置*/
  toOperateSetting:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    if(currIndex == 0){
      this.delMember();
    }else if(currIndex == 1){
      this.checkingMember();
    }
  },
  /**将成员设为助教  */
  assistantingMember:function(event){
    let that = this;
    let currIndex = event.currentTarget.dataset.currindex;
    this.data.currTrainee = this.data.memberList[currIndex];
    let data = {
      ctId:this.data.ctId,
      id: this.data.currTrainee.id,
      traineeId: this.data.currTrainee.traineeId,
    };
    let isAssistant = this.data.currTrainee.ifTa;
    let content = '确定将成员【'+that.data.currTrainee.traineeName+'】设置为助教吗？';
    let url = "wx/classroom-trainee-api/setTraineeToTeachingAssistant";
    if (isAssistant) {
      content = '确定取消成员【'+that.data.currTrainee.traineeName+'】的助教职务吗？';
      url = "wx/classroom-trainee-api/cancelTeachingAssistant";
    }
    core.dialogUtil.showModal({content:content},function() { 
      core.request({
        url: url,
        method: "POST",
        data: data,
        success: function(res) {
          if (res.data.code === 0) {
            that.data.settingHidden = true;
            that.data.currTrainee = {};
            that.setData({
              settingHidden:that.data.settingHidden,
              currTrainee:that.data.currTrainee
            })
            that.findMemberList(that.data.requestPage,false);
          }
        }
      });
    },function() {});
    that.data.memberList[currIndex].isTouchMove = false;
    that.setData({
      ['memberList['+currIndex+'].isTouchMove']:that.data.memberList[currIndex].isTouchMove
    })

    
  },
  /**删除课堂成员 */
  delMember:function(event){
    let that = this;
    let type = event.currentTarget.dataset.type;
    let data = {
      ctId:this.data.ctId,
      ids: [],
      traineeIds: [],
    };
    let content = '';
    if(type == 'all'){
      if(this.data.memberList && this.data.memberList.length>0){
        for(let i=0;i<this.data.memberList.length;i++){
          if(this.data.memberList[i].isChecked){
            data.traineeIds.push(this.data.memberList[i].traineeId);
            data.ids.push(this.data.memberList[i].id);
          }
        }
      }
      content = '是否将选择的成员移出课堂吗？';
      this.data.isCheckedAll = false;
      this.data.isShowChaVis = false;
      this.setData({
        isCheckedAll:this.data.isCheckedAll,
        isShowChaVis:this.data.isShowChaVis
      });

    }else  if(type == 'single'){
      let currIndex = event.currentTarget.dataset.currindex;
      this.data.currTrainee = this.data.memberList[currIndex];
      data.traineeIds.push(this.data.currTrainee.traineeId);
      data.ids.push(this.data.currTrainee.id);
      content = '确定将成员【'+that.data.currTrainee.traineeName+'】移除该课堂吗？';
      that.data.memberList[currIndex].isTouchMove = false;
      that.setData({
        ['memberList['+currIndex+'].isTouchMove']:that.data.memberList[currIndex].isTouchMove
      })
    }
    core.dialogUtil.showModal({content:content},function() { 
      core.request({
        url: "wx/classroom-trainee-api/deleteClassroomTraineeBatch",
        method: "POST",
        data: data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          if (res.data.code === 0) {
            that.data.settingHidden = true;
            that.data.currTrainee = {};
            that.setData({
              settingHidden:that.data.settingHidden,
              currTrainee:that.data.currTrainee
            })
            that.findMemberList(that.data.requestPage,false);
          }
        }
      });
    },function() {});
  },
  /**审核 成员 */
  checkingMember:function(event){
    let that = this;
    let type = event.currentTarget.dataset.type;
    let data = {
      ctId:this.data.ctId,
      traineeIds: [],
    };
    let content = '';
    let isCheckedNumber = 0;
    if(type == 'all' || type == 'allModal'){
      let name = 'memberList';
      if(this.data[name] && this.data[name].length>0){
        for(let i=0;i<this.data[name].length;i++){
          if(this.data[name][i].isChecked){
            if (this.data[name][i].state && this.data[name][i].state == 'Y') {
              isCheckedNumber++;
            } else {
              data.traineeIds.push(this.data[name][i].traineeId);
            }
          }
        }
      }
      content = '是否通过选择的成员的申请？';
      if (type == 'all'){
        this.data.isCheckedAll = false;
        this.data.isShowChaVis = false;
        this.setData({
          isCheckedAll:this.data.isCheckedAll,
          isShowChaVis:this.data.isShowChaVis
        });
      }

    }else  if(type == 'single'){
      let currIndex = event.currentTarget.dataset.currindex;
      this.data.currTrainee = this.data.memberList[currIndex];
      data.traineeIds.push(this.data.currTrainee.traineeId);
      content = '是否通过成员【'+that.data.currTrainee.traineeName+'】的申请？';
      that.data.memberList[currIndex].isTouchMove = false;
      that.setData({
        ['memberList['+currIndex+'].isTouchMove']:that.data.memberList[currIndex].isTouchMove
      })
    }

    
    if(!data.traineeIds || (data.traineeIds && data.traineeIds.length<1)){
      core.dialogUtil.showToast({title: ( isCheckedNumber > 0 ? '当前暂无未审核的成员':'清选择成员' ) });
      return false;
    }

    core.dialogUtil.showModal({content:content,confirmText:'通过',cancelText:'不通过'},function() { 
      data.isPass = 'Y';
      that.checkingMemberRequest(data);
    },function() {
      data.isPass = 'N';
      that.checkingMemberRequest(data);
    });
  },
  /** 审核 成员 的上传代码*/
  checkingMemberRequest:function(data){
    let that = this;
    core.request({
      url: "wx/classroom-trainee-check-api/setTraineeToClassroom",
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if(res.data.msg){
            core.dialogUtil.showToast({title:res.data.msg})
          }
          
          that.data.settingHidden = true;
          that.data.currTrainee = {};
          that.setData({
            settingHidden:that.data.settingHidden,
            currTrainee:that.data.currTrainee
          })
          that.findMemberList(that.data.requestPage,false);
        }
      }
    });
  },
  /**显示 或者隐藏  /删除、审核等成员设置*/
  settingHidden:function(event){
    let type = event.currentTarget.dataset.type;
    if(type == 'show'){
      let currIndex = event.currentTarget.dataset.currindex;
      this.data.currTrainee = this.data.memberList[currIndex];
      this.data.settingList[1].isShow = (this.data.currTrainee.state == 'Y')?false:true; 
      
    }else if(type == 'cancel'){
      this.data.currTrainee = {};
      this.data.settingList[1].isShow = true;
    }
    this.setData({
      currTrainee:this.data.currTrainee,
      ['settingList[1].isShow']:this.data.settingList[1].isShow,
      settingHidden: !this.data.settingHidden
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

    this.data.classroomState = (core.globalData.paramsData.classroomState) ? (core.globalData.paramsData.classroomState):'';

    this.data.assistantingMemberPerms = core.stringUtil.judgeIsPerms(core.globalData.paramsData.classroomIdentity,core.globalData.paramsData.isAssistant,core.globalData.paramsData.permsList,'room:trainee:settingAssistant');// 是否有 【设助教】  的 权限

    this.data.scrollPermsNum = 0;
    if (this.data.assistantingMemberPerms) {
      this.data.scrollPermsNum = this.data.scrollPermsNum + 1;
    }

    this.setData({
      ctId:this.data.ctId,
      classroomState:this.data.classroomState,
      assistantingMemberPerms:this.data.assistantingMemberPerms,
      scrollPermsNum: this.data.scrollPermsNum
    })
    this.findMemberList(this.data.requestPage,false);
    this.viewClassroomBaseInfo();
  },
  /**获取班级信息 */
  viewClassroomBaseInfo:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId
    };
    core.request({
      url: "wx/classroom-api/viewClassroomInfo",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          that.data.classInfo = {};

          if(core.stringUtil.objectIsNotNull(res.data.data) ){
            res.data.data.pic = core.concatImgUrl(res.data.data.pic);
            res.data.data.qrCode = core.concatImgUrl(res.data.data.qrCode);
            that.data.classInfo = res.data.data;
            if(res.data.data && res.data.data.name){
              let name = res.data.data.name
              wx.setNavigationBarTitle({//动态设置当前页面的标题
                title: '【'+name+'】成员'
              })
            }
          }
          that.setData({
            classInfo:that.data.classInfo
          })
        }
      }
    });
  },
  /**获取已加入学员列表数据 */
  findMemberList:function(requestPage, isLazy){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      pageNum: requestPage.pageNum,
      pageSize: requestPage.pageSize,
      traineeName:((this.data.traineeName)?(this.data.traineeName):'')
    };
    if (!isLazy) {
      data.pageNum = 1;
      that.data.memberList = [];
      that.data.addMemberPerms = false;
      that.data.delMemberPerms = false;
      that.data.editInfoMemberPerms = false;
      that.data.checkingMemberPerms = false;

      that.data.scrollPermsNum = 0;
      if (that.data.assistantingMemberPerms) {
        that.data.scrollPermsNum = that.data.scrollPermsNum + 1;
      }

      that.setData({
        memberList:  that.data.memberList,
        addMemberPerms:  that.data.addMemberPerms,
        delMemberPerms:  that.data.delMemberPerms,
        editInfoMemberPerms:  that.data.editInfoMemberPerms,
        checkingMemberPerms:  that.data.checkingMemberPerms,
        scrollPermsNum: that.data.scrollPermsNum,
      });
    }
    core.request({
      url: "wx/classroom-trainee-api/listClassroomTrainee",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          if (!isLazy) {
            that.data.memberList = [];

            that.data.addMemberPerms = (res.data.license && res.data.license.hasAddTraineePermission )?true:false;

            that.data.delMemberPerms = (res.data.license && res.data.license.hasDeleteTraineePermission )?true:false;

            that.data.editInfoMemberPerms = (res.data.license && res.data.license.hasEditTraineePermission )?true:false;

            that.data.checkingMemberPerms = (res.data.license && res.data.license.hasCheckTraineePermission )?true:false;

            that.data.scrollPermsNum = 0;
            
            if (that.data.delMemberPerms) {
              that.data.scrollPermsNum = that.data.scrollPermsNum + 1;
            }
            if (that.data.checkingMemberPerms) {
              that.data.scrollPermsNum = that.data.scrollPermsNum + 1;
            }
            if (that.data.editInfoMemberPerms) {
              that.data.scrollPermsNum = that.data.scrollPermsNum + 1;
            }
            if (that.data.assistantingMemberPerms) {
              that.data.scrollPermsNum = that.data.scrollPermsNum + 1;
            }

            that.setData({
              addMemberPerms:  that.data.addMemberPerms,
              delMemberPerms:  that.data.delMemberPerms,
              editInfoMemberPerms:  that.data.editInfoMemberPerms,
              checkingMemberPerms:  that.data.checkingMemberPerms,
              scrollPermsNum:  that.data.scrollPermsNum,
            });
          }
          if(res.data.data && res.data.data.list && res.data.data.list.length>0){
            let ss = res.data.data.list;
            for(let i=0;i<ss.length;i++){
              ss[i].traineePic = core.concatImgUrl(ss[i].traineePic);
              ss[i].isChecked = false;
              if(isLazy && that.data.isCheckedAll){
                ss[i].isChecked = true;
              }
              ss[i].isTouchMove = false;
              ss[i].startX = 0;
              ss[i].startY = 0;
              that.data.memberList.push( ss[i]);
            }
          }
          that.setData({
            memberList: that.data.memberList
          })
          if(res.data.data && res.data.data.currPage){
            that.data.requestPage.pageNum = res.data.data.currPage
            that.setData({
              ['requestPage.pageNum']: that.data.requestPage.pageNum
            })
          }
          if(res.data.data && res.data.data.totalPage){
            that.data.requestPage.pages = res.data.data.totalPage
            that.setData({
              ['requestPage.pages']:that.data.requestPage.pages
            })
          }
        }

        var pages = getCurrentPages(); // 当前页面
        if (pages && pages.length > 0) {
          for (let i=0;i<pages.length;i++) {
            if (pages[i].route == 'pages/tabbar/home/home') { // 更新列表的学习人数
              pages[i].findTeachingOrListeningClassList(pages[i].data.requestPage, false, {isLoad:'false'});
            } else if (pages[i].route == 'pages/tabbar/courselist/courselist') { // 更新列表的学习人数
              pages[i].findTabList({isLoad:'false'});
            }
          }
        }
      },
      fail: function () {
        var pages = getCurrentPages(); // 当前页面
        if (pages && pages.length > 0) {
          for (let i=0;i<pages.length;i++) {
            if (pages[i].route == 'pages/tabbar/home/home') { // 更新列表的学习人数
              pages[i].findTeachingOrListeningClassList(pages[i].data.requestPage, false, {isLoad:'false'});
            } else if (pages[i].route == 'pages/tabbar/courselist/courselist') { // 更新列表的学习人数
              pages[i].findTabList({isLoad:'false'});
            }
          }
        }
      }
    });
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
    core.globalData.paramsData.memberListEventType = '';
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
    let pageNum = parseInt(this.data.requestPage.pageNum) + 1;
    if (pageNum <= parseInt(this.data.requestPage.pages)) {
      this.data.requestPage.pageNum = pageNum;
      this.findMemberList(this.data.requestPage, true);
      this.setData({
        ['requestPage.pageNum']: this.data.requestPage.pageNum
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**将二维码保存到本地 */
  toSaveImage:function(){
    let that = this;
    core.service.downloadFile({
      url: that.data.classInfo.qrCode,
      success:function(res){
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              core.dialogUtil.showToast({title:'保存图片成功！'});
            },
            fail(res) {
              core.dialogUtil.showToast({title:'保存图片失败！'});
            }
          })
        }
      },
      fail:function(err){
        core.dialogUtil.showToast({title:'保存图片失败！'});
      }
    });
  },
  //显示二维码弹窗
  popupBox: function () {
    this.setData({
      popupBox: !this.data.popupBox
    })
  },

  //跳转添加成员模块
  toAddMember: function (e) {
    this.data.settingSheetHidden = true;
    this.setData({
      settingSheetHidden:this.data.settingSheetHidden
    });
    core.globalData.paramsData.memberListEventType = 'addMember';
    wx.navigateTo({
      url: '/pages/other/memberlist/memberlist'
    })
  },
  /**修改 学员信息 */
  editMemberInfo:function(event){
    let currIndex = event.currentTarget.dataset.currindex;
    let traineeId = this.data.memberList[currIndex].traineeId;
    wx.navigateTo({
      url: '/packageOne/me/peredit/peredit?traineeId='+traineeId+'&fromSourse='+'member'
    })
  },
  //跳转成员详情
  toPerShow: function (event) {
    let traineeId = event.currentTarget.dataset.traineeid;
    wx.navigateTo({
      url: '/pages/other/pershow/pershow?traineeId='+traineeId
    })
  }
})