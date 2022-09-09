// components/activity-comm/activity-comm.js
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
    chapterIdFromCha:{//来自章节的章节id
      type:String,
      value:''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    fixedBottom:core.globalData.fixedBottom,//解决苹果手机底部横杠遮挡 的 固定到底部的安全距离
    funAddHidden: "true",//创建活动 是否显示
    signInHidden: "true",//签到选择 是否显示
    activSetHidden: "true",//编辑、删除、开始 弹窗 是否显示
    activityTitle:'',//输入框模糊查询
    activityStateArray:[],//全部、未开始等状态数组
    currActivityStateIndex:0,//当前 状态下标，取dictCode的值
    activityList:[],//活动列表 数组
    pkgId: '',//教学包id
    ctId:'',//课堂id
    classType:'',//1加入的课堂（我听的课）2自己创建的课堂（我教的课）
    currEditActivity:{},//当前编辑的活动
    noDataActIsShow:false,//暂无数据是否显示
    isIntoPageIsShow:false,//是否执行了pageIsShow方法
    creatorActList:[
      {name:'签到',icon:'iconqiandao',eventName:'signInTap'},
      {name:'通知',icon:'iconxiaoxitongzhi',eventName:'toNotice'},
      {name:'课堂表现',icon:'iconketangbiaoxian',eventName:'toKtbx'},
      {name:'投票/问卷',icon:'iconwenjuantiaocha',eventName:'toCreateWj'}
    ],//创建活动的列表
    modalActivityEndTimeDatas:{
      startDate: core.dateUtil.getDate('now','seconds'),//日期选择器 的开始时间
      endDate: core.dateUtil.getDate('end','seconds'),//日期选择器 的结束时间
      pickerDataIsShow:false,//日期选择器是否显示
      showModal:false,//对话框是否显示
      activityEndTime: '',
    },//设置活动结束时间 的一些 对话框和下拉选择框的参数
    classRoomBaseInfo:{},//课堂的基本信息
    hasAddActPermission: false,// 是否有 【创建活动】  的 权限
    startActiPerms: false,// 是否有 【开始活动】  的 权限
    endActiPerms: false,// 是否有 【结束活动】  的 权限
    editActiPerms: false,// 是否有 【编辑活动】  的 权限
    delActiPerms: false,// 是否有 【删除活动】  的 权限
    scrollActiPermsNum:0,// 点击活动列表 出现的权限的个数
    classroomIdentity:'', // 课堂 里面的 身份
  },
  ready: function() { //组件生命周期函数-在组件布局完成后执行
    this.pageIsShow();
  },
  pageLifetimes: {//组件所在页面的生命周期声明对象
    show: function() {// 页面被展示
      core.globalData.paramsData.testActivityType = ''
      this.pageIsShow();
    },
    hide: function() {// 页面被隐藏
      this.data.isIntoPageIsShow = false;
      this.setData({
        isIntoPageIsShow:this.data.isIntoPageIsShow
      })
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /** 开始活动弹窗 点击确定或者取消按钮 */
    modalClose:function(event){
      if(event.detail.confirm){//modal弹窗点击确定
        this.toOperationActivity({currentTarget:{dataset:{type:'start',haveEndTime:'true'}}});
      }else{//modal弹窗点击取消
      }
      this.data.modalActivityEndTimeDatas.activityEndTime = '';
      this.data.modalActivityEndTimeDatas.showModal = false;
      this.setData({
        ['modalActivityEndTimeDatas.showModal']:this.data.modalActivityEndTimeDatas.showModal,
        ['modalActivityEndTimeDatas.activityEndTime']:this.data.modalActivityEndTimeDatas.activityEndTime
      });
    },
    /** 清空活动结束时间 */
    toClearDateTime:function () {
      this.data.modalActivityEndTimeDatas.activityEndTime = '';
      this.setData({
        ['modalActivityEndTimeDatas.activityEndTime']:this.data.modalActivityEndTimeDatas.activityEndTime
      });
    },
    /** 开始活动 显示自定义 弹窗 */
    toStartActivity: function (){
      if (this.data.currEditActivity.activityType && this.data.currEditActivity.activityType == '9') {
        this.toOperationActivity({currentTarget:{dataset:{type:'start'}}});
        return false;
      }
      this.data.modalActivityEndTimeDatas.activityEndTime = '';
      this.data.modalActivityEndTimeDatas.showModal = true;
      this.data.modalActivityEndTimeDatas.startDate = core.dateUtil.getDate('now','seconds');//日期选择器 的开始时间
      this.data.modalActivityEndTimeDatas.endDate = core.dateUtil.getDate('end','seconds');//日期选择器 的结束时间
      this.setData({
        activSetHidden: true,
        ['modalActivityEndTimeDatas.showModal']:this.data.modalActivityEndTimeDatas.showModal,
        ['modalActivityEndTimeDatas.startDate']:this.data.modalActivityEndTimeDatas.startDate,
        ['modalActivityEndTimeDatas.endDate']:this.data.modalActivityEndTimeDatas.endDate,
        ['modalActivityEndTimeDatas.activityEndTime']:this.data.modalActivityEndTimeDatas.activityEndTime
      });
    },
    /**日期选择器点击确定 */
    pickerDataSure:function(event){
      this.data.modalActivityEndTimeDatas.pickerDataIsShow = false;
      this.data.modalActivityEndTimeDatas.activityEndTime = event.detail;
      this.setData({
        ['modalActivityEndTimeDatas.pickerDataIsShow']:this.data.modalActivityEndTimeDatas.pickerDataIsShow,
        ['modalActivityEndTimeDatas.activityEndTime']:this.data.modalActivityEndTimeDatas.activityEndTime
      });
    },
    /**显示 设置活动结束时间弹窗 */
    toShowPickerData:function(){
      this.data.modalActivityEndTimeDatas.pickerDataIsShow = true;
      this.setData({
        ['modalActivityEndTimeDatas.pickerDataIsShow']:this.data.modalActivityEndTimeDatas.pickerDataIsShow
      });
    },
    /**page显示要做的事情  */
    pageIsShow:function(){
      if(this.data.isIntoPageIsShow){
        return false;
      }
      this.data.isIntoPageIsShow = true;
      this.setData({
        isIntoPageIsShow:this.data.isIntoPageIsShow
      })
      this.pageIsShowComm();
    },
    /**刷新页面时要调的方法 */
    pageIsShowComm:function(){

      this.data.pkgId = (core.globalData.paramsData.pkgId) ? (core.globalData.paramsData.pkgId):'';

      this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';

      this.data.classType = (core.globalData.paramsData.classType) ? (core.globalData.paramsData.classType):'';

      this.data.classroomIdentity = (core.globalData.paramsData.classroomIdentity) ? (core.globalData.paramsData.classroomIdentity):'';

      this.data.startActiPerms = core.stringUtil.judgeIsPerms(core.globalData.paramsData.classroomIdentity,core.globalData.paramsData.isAssistant,core.globalData.paramsData.permsList,'room:act:start');

      this.data.endActiPerms = core.stringUtil.judgeIsPerms(core.globalData.paramsData.classroomIdentity,core.globalData.paramsData.isAssistant,core.globalData.paramsData.permsList,'room:act:end');

      this.data.editActiPerms = core.stringUtil.judgeIsPerms(core.globalData.paramsData.classroomIdentity,core.globalData.paramsData.isAssistant,core.globalData.paramsData.permsList,'room:act:edit');

      this.data.delActiPerms = core.stringUtil.judgeIsPerms(core.globalData.paramsData.classroomIdentity,core.globalData.paramsData.isAssistant,core.globalData.paramsData.permsList,'room:act:delete');

      this.setData({
        pkgId:this.data.pkgId,
        ctId:this.data.ctId,
        classType:this.data.classType,
        startActiPerms:this.data.startActiPerms,
        endActiPerms:this.data.endActiPerms,
        editActiPerms:this.data.editActiPerms,
        delActiPerms:this.data.delActiPerms,
        classroomIdentity: this.data.classroomIdentity
      })
      this.viewClassroomBaseInfo();
      this.findActivityStateArray();

      this.handGlobalData();
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
            
            that.data.classRoomBaseInfo = (res.data.data)?(res.data.data):{};
            that.setData({
              classRoomBaseInfo:that.data.classRoomBaseInfo
            });
            if(res.data.data && res.data.data.name){
              let name = res.data.data.name
              wx.setNavigationBarTitle({//动态设置当前页面的标题
                title: '【'+name+'】活动'
              })
            }
          }
        }
      });
    },
    /**收缩 活动列表 */
    toFoldActivity:function(event){
      let currIndex = event.currentTarget.dataset.currindex;
      this.data.activityList[currIndex].isShowActivity = !(this.data.activityList[currIndex].isShowActivity);
      this.setData({
        ['activityList['+currIndex+'].isShowActivity']:this.data.activityList[currIndex].isShowActivity
      });
    },
    /**签到 前往三个签到页面 */
    toOperateSign:function(event){
      this.data.signInHidden = true;
      this.setData({
        signInHidden:this.data.signInHidden
      });
      let type = event.currentTarget.dataset.type;
      if(type == 'createptqd'){//普通签到
        this.createPuqd("1");
      }else if(type == 'createsgdj'){
        this.createPuqd("3");
      }else if(type =='createssqd'){
        wx.navigateTo({
          url: '/packageOne/create/'+type+'/'+type,
        })
      }
    },
    /**创建普通签到或者手工签到 */
    createPuqd:function(signType){
      let that = this;
      let data = {
        activityId:"",
        signType:signType,
        pkgId:this.data.pkgId
      };
      if(signType == '3'){
        core.request({
          url: "wx/activity-api/signin/saveSigninInfo?token="+core.globalData.userInfo.token+'&pkgId='+that.data.pkgId,
          method: "POST",
          header: {
            'content-type': 'application/json' // 默认值
          },
          data:data,
          success: function(res) {
            if(res.data.code == 0){
              if(res.data.msg){
                core.dialogUtil.showToast({title:res.data.msg});
              }
              that.findActivityStateArray();
              wx.navigateTo({
                url: '/packageOne/create/createsgdj/createsgdj?activityId='+res.data.data,
              })
              core.globalData.paramsData.activityIndex = 1;
            }
          }
        });
      }else{
        core.dialogUtil.showModal({content:'确定创建普通签到吗？'},function() {
          core.request({
            url: "wx/activity-api/signin/saveSigninInfo?token="+core.globalData.userInfo.token+'&pkgId='+that.data.pkgId,
            method: "POST",
            header: {
              'content-type': 'application/json' // 默认值
            },
            data:data,
            success: function(res) {
              if(res.data.code == 0){
                core.globalData.paramsData.activityIndex = 1;
                if(res.data.msg){
                  core.dialogUtil.showToast({title:res.data.msg})
                }
                that.findActivityStateArray();
              }
            }
          });
        },function() {});
      }
    },
    /**输入框模糊查询 */
    bindinput:function(event){
      this.data.activityTitle = event.detail.value;
      this.setData({
        activityTitle:this.data.activityTitle
      })
    },
    /**搜索 活动 */
    searchInput:function(){
      this.findActivityList();
    },
    /**进行tab的切换 */
    toChangeTab:function(event){
      this.data.currActivityStateIndex = event.currentTarget.dataset.currindex;
      core.globalData.paramsData.activityIndex = this.data.currActivityStateIndex;
      this.setData({
        currActivityStateIndex:this.data.currActivityStateIndex
      })
      this.findActivityList();
    },
    /**获取 全部、未开始等状态数组*/
    findActivityStateArray:function(){
      let that = this;
      let data = {
        ctId:that.data.ctId,
        pkgId:that.data.pkgId,
        activityType:that.data.classType,
      };
      if(this.properties.chapterIdFromCha){
        data.chapterId = this.properties.chapterIdFromCha;
      }else  if(core.globalData.paramsData.chapterIdFromCha){
        data.chapterId = core.globalData.paramsData.chapterIdFromCha;
      }

      core.request({
        url: "wx/activity-api/listActivityState?token="+core.globalData.userInfo.token,
        method: "GET",
        data:data,
        success: function(res) {
          if (res.data.code === 0) {
            that.data.activityStateArray = []
            if(res.data.data && res.data.data.length>0){
              that.data.activityStateArray = res.data.data
            }
            that.setData({
              activityStateArray: that.data.activityStateArray
            })
            that.findActivityList();
          }
        }
      });
    },
    /**获取活动列表数组*/
    findActivityList:function(){
      core.globalData.paramsData.currEditActivity = {}
      let that = this;
      that.data.noDataActIsShow = false;
      this.data.currEditActivity = {};
      
      this.data.currActivityStateIndex = core.globalData.paramsData.activityIndex;//活动状态
      this.setData({
        noDataActIsShow:that.data.noDataActIsShow,
        currEditActivity:that.data.currEditActivity,
        currActivityStateIndex: this.data.currActivityStateIndex 
      });
      let currActivityStateArray = this.data.activityStateArray[this.data.currActivityStateIndex]
      let data={
        pkgId:this.data.pkgId,
        ctId:this.data.ctId,
        activityTitle:this.data.activityTitle,
        activityState:currActivityStateArray.dictCode,
        activityType:this.data.classType,
      };
      if(this.properties.chapterIdFromCha){
        data.chapterId = this.properties.chapterIdFromCha;
      }else  if(core.globalData.paramsData.chapterIdFromCha){
        data.chapterId = core.globalData.paramsData.chapterIdFromCha;
      }
      core.request({
        url: "wx/activity-api/listActivity",
        method: "GET",
        data:data,
        success: function(res) {
          if (res.data.code === 0) {
            that.data.activityList = []
            if(res.data.data && res.data.data.length>0){
              let data1 = res.data.data
              for(let a=0;a<data1.length;a++){
                data1[a].isShowActivity = true;
                if(data1[a].children && data1[a].children.length>0){
                  let data2 = data1[a].children
                  for(let a2=0;a2<data2.length;a2++){
                    data2[a2].isIconalbb = false;
                    if(core.stringUtil.startWith(data2[a2].activityPic, "iconfont")){
                      data2[a2].isIconalbb = true;

                      data2[a2].activityIcon = data2[a2].activityPic;
                    }else{
                      data2[a2].activityIcon = core.service.getActivitySvg(data2[a2].activityType,null);
                    }
                    data2[a2].activityPic = core.concatImgUrl(data2[a2].activityPic);

                    // 获取 点击活动列表 出现的权限的个数
                    data2[a2].scrollActiPermsNum = 0;
                    if(!data2[a2].hasDeleteActPermission){// 删除活动  || !that.data.delActiPerms  !data2[a2].hasPermission || 
                    } else {
                      data2[a2].scrollActiPermsNum = data2[a2].scrollActiPermsNum +1;
                    }
                    if(data2[a2].activityState != '0' || (data2[a2].activityType=='8' && data2[a2].signType == '1')  || (data2[a2].activityType=='6' ) || (!data2[a2].hasEditActPermission )  ){// 编辑活动   || (!that.data.editActiPerms )   || !data2[a2].hasPermission
                    } else {
                      data2[a2].scrollActiPermsNum = data2[a2].scrollActiPermsNum +1;
                    }
                    if((data2[a2].activityType == '8' &&  data2[a2].signType != '2') || (data2[a2].activityType=='6' ) ){// 查看信息 活动
                    } else {
                      data2[a2].scrollActiPermsNum = data2[a2].scrollActiPermsNum +1;
                    }
                    if(data2[a2].activityState != '0' || (data2[a2].activityType=='8' && data2[a2].signType == '3') || !data2[a2].hasStartActPermission){// 开始活动    ||  !that.data.hasStartActPermission
                    } else {
                      data2[a2].scrollActiPermsNum = data2[a2].scrollActiPermsNum +1;
                    }
                    if(data2[a2].activityState != '1' || !data2[a2].hasEndActPermission){// 结束活动 || !that.data.endActiPerms
                    } else {
                      data2[a2].scrollActiPermsNum = data2[a2].scrollActiPermsNum +1;
                    }

                  }
                }
              }
              that.data.activityList = res.data.data
            }
            if ( res.data.activityNum || res.data.activityNum == 0 ) {
              that.setData({
                ['activityStateArray['+that.data.currActivityStateIndex+'].num']: res.data.activityNum
              })
            }
            that.data.hasAddActPermission = (res.data.hasAddActPermission)?true:false;
            that.setData({
              activityList: that.data.activityList,
              hasAddActPermission: that.data.hasAddActPermission
            })
          }
          if((!data.activityState || data.activityState == '0') && (!that.data.activityList || (that.data.activityList && that.data.activityList.length < 1))){
            that.data.noDataActIsShow = true;
            that.setData({
              noDataActIsShow:that.data.noDataActIsShow
            });
          }
        },
        fail:function(){
          if((!data.activityState || data.activityState == '0') && (!that.data.activityList || (that.data.activityList && that.data.activityList.length < 1))){
            that.data.noDataActIsShow = true;
            that.setData({
              noDataActIsShow:that.data.noDataActIsShow
            });
          }
        }
      });
    },
    /**处理 清空 全局变量 */
    handGlobalData:function(){
      core.globalData.paramsData.currEditActivity = {};//当前选择的活动
      core.globalData.questionnaireData.firstData = {};//活动-投票/问卷-第一页基本数据
      core.globalData.questionnaireData.secondData = {};//活动-投票/问卷-第二页题目数据
      core.globalData.noticeData = {};//活动-通知数据
      core.globalData.classroomPerformanceData = {}; // 活动-课堂表现数据
      core.globalData.paramsData.messagingType = '';//消息的类型
      core.globalData.paramsData.onlyWatchActivityInfo = ''; // 是否查看 创建活动的活动详情
    },
    //显示活动页脚选项
    funAddTap: function () {
      this.data.currEditActivity = {};
      this.handGlobalData();
      this.setData({
        currEditActivity:this.data.currEditActivity,
        funAddHidden: !this.data.funAddHidden
      })
    },
    //显示签到页脚选项
    signInTap: function () {
      this.setData({
        signInHidden: !this.data.signInHidden,
        funAddHidden: true
      })
    },
    //显示活动设置页脚选项
    activSetHidden: function (event) {
      let type = event.currentTarget.dataset.type;
      if(type == 'show'){
        let currIndex = event.currentTarget.dataset.currindex;
        let preIndex = event.currentTarget.dataset.preindex;
        this.data.currEditActivity = this.data.activityList[preIndex].children[currIndex];
        this.setData({
          currEditActivity:this.data.currEditActivity
        })
        core.globalData.paramsData.currEditActivity = Object.assign({},this.data.currEditActivity);
        
      }else if(type == 'cancel'){
        core.globalData.paramsData.currEditActivity = {};
      }
      this.setData({
        activSetHidden: !this.data.activSetHidden
      })
    },
    //跳转到课堂表现页面
    toKtbx: function (e) {
      wx.navigateTo({
        url: '/packageOne/create/createktbx/createktbx',
      })
      this.setData({
        funAddHidden: true
      })
    },
    //发送通知
    toNotice: function (e) {
      this.setData({
        funAddHidden: true
      })
      wx.navigateTo({
        url: '/pages/other/notice/notice',
      })
    },
    /**去 查看手势签到  */
    toShowSsqd:function(){
      this.setData({
        activSetHidden: true
      })
      let url = '/packageOne/create/createssqd/createssqd?activityId='+this.data.currEditActivity.activityId+'&type=showdetail';
      wx.navigateTo({
        url: url,
      })
    },
    /** 去查看活动 创建时 的信息 */
    toShowActivityInfo:function(){
      core.globalData.paramsData.onlyWatchActivityInfo = 'true';
      this.toEditActivity({isView: true});
    },
    /**编辑 活动 activityType的值来区别 1投票问卷2头脑风暴3答疑讨论5作业/小组任务6课堂表现7轻直播/讨论8签到   4测试活动 */
    toEditActivity:function(e){
      let currEditActivity = this.data.currEditActivity
      if(core.stringUtil.objectIsNotNull(currEditActivity) ){
        if(currEditActivity.activityType && currEditActivity.activityType == '1'){
          this.toCreateWj();
        }else if(currEditActivity.activityType && currEditActivity.activityType == '6'){
          this.toKtbx();
        }else if(currEditActivity.activityType && currEditActivity.activityType == '8'){
          if(currEditActivity.signType && currEditActivity.signType =='2'){//手势签到
            wx.navigateTo({
              url: '/packageOne/create/createssqd/createssqd?activityId='+currEditActivity.activityId,
            })
          }else if(currEditActivity.signType && currEditActivity.signType =='3'){//手工签到
            wx.navigateTo({
              url:  '/packageOne/create/createsgdj/createsgdj?activityId='+currEditActivity.activityId,
            })
          }
        }
      }
      this.setData({
        activSetHidden: !this.data.activSetHidden
      })
    },
    /**查看活动 activityType的值来区别 1投票问卷6课堂表现8签到*/
    toShowActivity:function(event){
      let currIndex = event.currentTarget.dataset.currindex;
      let preIndex = event.currentTarget.dataset.preindex;
      this.data.currEditActivity = this.data.activityList[preIndex].children[currIndex];
      this.setData({
        currEditActivity:this.data.currEditActivity
      })
      core.globalData.paramsData.currEditActivity = Object.assign({},this.data.currEditActivity);
      let activityType = this.data.currEditActivity.activityType;
      let activityState = this.data.currEditActivity.activityState;

      if (this.data.classroomIdentity && this.data.classroomIdentity == 'teacher') {
        let url = '';
        if(activityType && activityType == '1'){
          url = '/pages/other/xqwj/xqwj';//问卷详情
        }else if(activityType && activityType == '6'){ // 课堂表现
          if(activityState && activityState == '2'){//已结束
            url = '/pages/other/xqktbxend/xqktbxend'
          }else{
            if(this.data.currEditActivity.type && this.data.currEditActivity.type =='1'){ // 抢答页面
              url = '/pages/other/rushanswer/rushanswer'
            } else  if(this.data.currEditActivity.type && this.data.currEditActivity.type =='2'){ // 随机选人页面
              url = '/pages/other/random/random'
            } else  if(this.data.currEditActivity.type && this.data.currEditActivity.type =='3'){ // 手动选人页面
              url = '/pages/other/manual/manual'
            }
          }
        }else if(activityType && activityType == '8'){//签到
          if(activityState && activityState == '2'){//已结束   signType  2手势签到  3  手工签到
            url = '/packageOne/create/createsgdj/createsgdj?activityId='+this.data.currEditActivity.activityId+'&type=showdetail';
          }else{
            url = '/packageOne/create/createsgdj/createsgdj?activityId='+this.data.currEditActivity.activityId;
          }
        }
        wx.navigateTo({
          url: url,
        })
      } else {
        let url = '';
        if(activityType && activityType == '1'){ //问卷
          if(activityState == '2'){
            url = '/pages/other/xqwj/xqwj';//已经做过
          }else {
            if(this.data.currEditActivity.hasBeenDone){
              url = '/pages/other/xqwj/xqwj';//已经做过
            }else{//没有做过
              url = '/pages/other/stuxqwj/stuxqwj';
            }
          }

        }else if(activityType && activityType == '6'){ // 课堂表现
          if(activityState && activityState == '2'){//已结束
            url = '/pages/other/xqktbxend/xqktbxend';
          }else{
            this.stuToRushAnswer({ctId:this.data.ctId,activityId: this.data.currEditActivity.activityId});
            url = '/pages/other/rushanswer/rushanswer?fromPages='+'stuShowDetail';
          }
        }else if(activityType && activityType == '8'){//签到
          if(activityState && activityState == '2'){//已结束   signType  2手势签到  3  手工签到  1 普通签到
            url = '/packageOne/create/createsgdj/createsgdj?activityId='+this.data.currEditActivity.activityId+'&type=showdetail';
          }else{
            if(this.data.currEditActivity.signType && this.data.currEditActivity.signType =='2'){//手势签到
              url = '/pages/other/stussqd/stussqd?activityId='+this.data.currEditActivity.activityId;
            }else if(this.data.currEditActivity.signType && this.data.currEditActivity.signType =='1'){//普通签到
              url = '/pages/other/stuptqd/stuptqd?activityId='+this.data.currEditActivity.activityId;
            }else if(this.data.currEditActivity.signType && this.data.currEditActivity.signType =='3'){//手工签到
              if (this.data.classroomIdentity && this.data.classroomIdentity == 'assistant') {
                return false;
              } else {
                return false;
              }
            }
          }
        }
        wx.navigateTo({
          url: url,
        })
      }

      
    },
    /** 学员 点击抢答按钮 进行抢答  */
    stuToRushAnswer:function(data){
      let that = this;
      core.request({
        url: "wx/activity-api/performance/traineeAnswer",
        method: "POST",
        data: data,
        success: function(res) {
          if (res.data.code === 0) {
          }
        }
      });
    },
    /**对活动进行开始、删除等操作 */
    toOperationActivity:function(event){
      let type = event.currentTarget.dataset.type;
      let that = this;
      that.setData({
        activSetHidden: true
      })
      let data = {
        activityId:this.data.currEditActivity.activityId,
        activityType:this.data.currEditActivity.activityType,
        pkgId:this.data.pkgId,
        ctId:this.data.ctId,
      };
      let url = 'wx/activity-api/startActivity';
      if (type && type == 'start') {
        data.activityEndTime = (this.data.modalActivityEndTimeDatas.activityEndTime)? (this.data.modalActivityEndTimeDatas.activityEndTime):'';
      }
      let content = '确定开始吗？';
      if(type && type == 'delete'){
        url = 'wx/activity-api/deleteActivity';
        content = '确定删除吗？';
      }else if(type && type == 'end'){
        url = 'wx/activity-api/endActivity';
        content = '确定结束吗？';
      }
      if (event.currentTarget.dataset.haveEndTime && event.currentTarget.dataset.haveEndTime == 'true') {// 开始活动设置了活动自动结束时间
        that.toOperationActivityRequestComm(url,data ,type);
      } else {
        core.dialogUtil.showModal({content:content},function() {
          that.toOperationActivityRequestComm(url,data ,type);
        },function() {});
      }
      
      
    },
    /**对活动进行开始、删除等操作 的 公共request方法 */
    toOperationActivityRequestComm:function(url,data ,type){
      let that = this;
      core.request({
        url: url,
        method: "POST",
        timeout:30000,
        data:data,
        success: function(res) {
          if(res.data.code == 0){
            if(res.data.msg){
              core.dialogUtil.showToast({title:res.data.msg})
            }
            if(type && type == 'start'){
              core.globalData.paramsData.activityIndex = 2;
            }else if(type && type == 'end'){
              core.globalData.paramsData.activityIndex = 3;
            }
            that.findActivityStateArray();
          }
        }
      });
    },
    //创建问卷调查
    toCreateWj: function (e) {
      wx.navigateTo({
        url: '/packageOne/create/createwj/createwj',
      })
      this.setData({
        funAddHidden: true
      })
    }


  }
})