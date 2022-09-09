// pages/course/codejoin/codejoin.js
const app = getApp();
const core = require("../../../utils/core/core.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invitationCode:'',//输入的邀请码
    showClass:false,//是否显示班级信息
    classroomList:[],//课堂列表
    inputFocus:false,//input是否聚焦
    currCheckedClassRoom:{},//选中的课堂
    isShowInvCode:true,//是否显示邀请码输入框
    isClearInput:false,//是否点击 清除按钮
    isPassApply:false,//加入课堂是否通过申请
    noSearchClassRoom:'noSearch',//搜索结果是否没有课堂  'noSearch'没有搜索课堂  'searchNoList' 搜索结果没有课堂 'searchHasList' 搜索结果有课堂 
  },
  /**选择的课堂 的 radio的change事件 */
  radioChange:function(event){
    this.data.currCheckedClassRoom = this.data.classroomList[event.detail.value] ;
    this.setData({
      currCheckedClassRoom:this.data.currCheckedClassRoom
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.isShowInvCode = true;
    if(core.stringUtil.objectIsNotNull(core.globalData.paramsData.courseListCurrJoiningRoom) ){
      this.data.classroomList = [];
      this.data.classroomList.push(core.globalData.paramsData.courseListCurrJoiningRoom);
      this.data.currCheckedClassRoom = core.globalData.paramsData.courseListCurrJoiningRoom;
      this.data.showClass = true;
      this.data.isShowInvCode = false;
      wx.setNavigationBarTitle({//动态设置当前页面的标题
        title: '加入课堂'
      })
      this.data.isPassApply = false;
      if(this.data.currCheckedClassRoom.isCheck =='Y' && this.data.currCheckedClassRoom.isApply && !this.data.currCheckedClassRoom.isPass &&  !this.data.currCheckedClassRoom.isOwner){
        this.data.isPassApply = true;
        // core.dialogUtil.showToast({title:'此课堂老师还未通过你的审核，请耐心等待'});
      }
      this.setData({
        classroomList:this.data.classroomList,
        isPassApply:this.data.isPassApply,
        currCheckedClassRoom:this.data.currCheckedClassRoom,
        showClass:this.data.showClass
      });
    }
    this.setData({
      isShowInvCode:this.data.isShowInvCode
    });
  },
  /**input聚焦事件 */
  bindfocus:function(e){
    this.setData({
      inputFocus: true,
      isClearInput:false
    })
  },
  /**清空 邀请码*/
  toClearInput:function(e){
    this.setData({
      invitationCode:'',
      showClass: false,
      currCheckedClassRoom:{},
      classroomList:[],
      isClearInput:true
    })
  },
  bindinput:function(event){
    this.data.invitationCode = event.detail.value;
    this.setData({
      invitationCode:this.data.invitationCode
    })
  },
  /**邀请码搜索班级 input失焦事件 */
  checkCode:function(e){
    this.data.inputFocus = false;
    this.data.noSearchClassRoom = 'noSearch';

    let that=this;
    that.data.classroomList = [];
    that.data.currCheckedClassRoom = {};
    that.data.showClass = false;
    that.setData({
      inputFocus: this.data.inputFocus,
      noSearchClassRoom: this.data.noSearchClassRoom,
      showClass: that.data.showClass,
      currCheckedClassRoom: that.data.currCheckedClassRoom,
      classroomList: that.data.classroomList
    })

    if ( core.stringUtil.trim(that.data.invitationCode)){
      core.request({
        url: "wx/classroom-api/byInvitationCodeSearchClassroom",
        method: "GET",
        data: {
          invitationCode: that.data.invitationCode
        },
        success: function (res) {
          if (res.data.code === 0) {
            that.data.classroomList = [];
            that.data.currCheckedClassRoom = {};
            that.data.showClass = false
            if (res.data.data && res.data.data.list && res.data.data.list.length > 0) {
              let ss = res.data.data.list
              for(let a=0;a<ss.length;a++){
                ss[a].pic= core.concatImgUrl(ss[a].pic);
                ss[a].teacherPic= core.concatImgUrl(ss[a].teacherPic);
                ss[a].traineePic= core.concatImgUrl(ss[a].traineePic);
              }
              that.data.classroomList = ss;
              that.data.currCheckedClassRoom = ss[0];
              that.data.showClass = true
              
            }
            if(that.data.isClearInput){
              // that.toClearInput();
              return false;
            }
            that.setData({
              showClass: that.data.showClass,
              currCheckedClassRoom: that.data.currCheckedClassRoom,
              classroomList: that.data.classroomList
            })
          }
          if (that.data.classroomList && that.data.classroomList.length >0){
            that.data.noSearchClassRoom = 'searchHasList';
          }else{
            that.data.noSearchClassRoom = 'searchNoList';
          }
          that.setData({
            noSearchClassRoom:that.data.noSearchClassRoom 
          });
        },
        fail:function(){
          if (that.data.classroomList && that.data.classroomList.length >0){
            that.data.noSearchClassRoom = 'searchHasList';
          }else{
            that.data.noSearchClassRoom = 'searchNoList';
          }
          that.setData({
            noSearchClassRoom:that.data.noSearchClassRoom 
          });
        }
      });
    }
  },
  //邀请码加入班级
  joinClassroom:function(){
    let that=this;
    if(core.globalData.paramsData.isFromCourseList && core.globalData.paramsData.isFromCourseList == 'true'){

    }else{
      if(!that.data.invitationCode){
        core.dialogUtil.showToast({title:'请输入邀请码'});
        return false;
      }
      if(!that.data.classroomList || (that.data.classroomList && that.data.classroomList.length<1)){
        core.dialogUtil.showToast({title:'该邀请码未匹配到相对应的课堂，请重新输入'});
        return false;
      }
    }
    if(!that.data.currCheckedClassRoom.ctId){
      core.dialogUtil.showToast({title:'请选择要加入的课堂'});
      return false;
    }
    core.request({
      url: "wx/classroom-api/joinTheClassroom",
      data: {
        ctId: that.data.currCheckedClassRoom.ctId,
        // invitationCode:that.data.invitationCode
      },
      success: function (res) {
        if (res.data.code === 0) {
          if(res.data.data && res.data.data.code == 520){
            if(res.data.data.msg){
              core.dialogUtil.showToast({title:res.data.data.msg})
            }
            setTimeout(function(){
              if(core.globalData.paramsData.isFromCourseList && core.globalData.paramsData.isFromCourseList == 'true'){
                wx.reLaunch({
                  url: '/pages/tabbar/courselist/courselist',
                })
              }else{
                wx.reLaunch({
                  url: '/pages/tabbar/home/home',
                })
              }
            },core.globalData.operState.duration)
          }else{
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            core.globalData.paramsData.pkgId = (res.data.data && res.data.data.pkgId)?(res.data.data.pkgId):'';
            core.globalData.paramsData.ctId = (res.data.data && res.data.data.ctId)?(res.data.data.ctId):'';
            core.globalData.paramsData.subjectId = (res.data.data && res.data.data.subjectId)?(res.data.data.subjectId):'';
            core.globalData.paramsData.classId = (res.data.data && res.data.data.classId)?(res.data.data.classId):'';
            core.globalData.paramsData.classType = '1';
            core.globalData.paramsData.classroomIdentity = 'student';
            wx.redirectTo({
              url: '/pages/classroom/resource/resource',  // classroom  stuactivity
            })
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
    core.globalData.paramsData.pkgId = '';
    core.globalData.paramsData.ctId = '';
    core.globalData.paramsData.subjectId = '';
    core.globalData.paramsData.classId = '';
    core.globalData.paramsData.classType = '';
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