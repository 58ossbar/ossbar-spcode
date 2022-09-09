const enumUtil = require("enumutil.js");
let commUrl = "https://frp.creatorblue.com";
let version = __wxConfig.envVersion;
if (version =="develop"){ //工具或者真机 开发环境  192的是以http和ws开头
  commUrl =  "https://frp.creatorblue.com"; // "http://192.168.1.100:8080";  //  'http://39.99.132.73'; //
}else if (version =="trial"){ //测试环境(体验版)
  commUrl = "https://frp.creatorblue.com";
}else if (version =="release"){ //正式环境
  commUrl = "";
}
module.exports ={
  sysInfo: {//系统信息
    appInfo: {//应用程序信息wa
      appState: enumUtil.appState.DEV,//应用程序状态，包括开发模式(dev)、测试模式(test)、生产模式(prod)，值从appState枚举中获取
    },
    netWorkInfo: { //网络信息
      networkType: enumUtil.appState.NONE,//连接方式 wifi,2G,3G,4G,5G
      state: false //网络连接状态，false为未连接，true为连接
    }
  },
  consultingServiceInfo: {
    corpId:'', //企业ID corpId
    extInfoUrl:'',//客服信息 extInfoUrl
  },//在线 咨询 wx.openCustomerServiceChat 方法参数
  questionnaireData:{//活动-投票/问卷数据
    firstData:{},//第一页基本数据
    secondData:{},//第二页题目数据
  },
  noticeData:{},//活动-通知数据
  classroomPerformanceData:{},//活动-课堂表现数据
  paramsData:{},//参数信息
  userInfo: {//用户信息 
    token: "",
    code: "",//登录token
    state : "1",// 是否注册了手机0注册1未注册
    hasUserInfo : false,//是否初始化用户信息
  },
  containerBottom:106, //底部导航栏的高度，单位rpx
  myInfo:{},//数据库查出来的用户信息
  serverInfo: {//远程服务器信息
    url: commUrl+"/sp/", // "https://frp.creatorblue.com/sp/", // 
    imgUrl:  commUrl+"/sp", // "https://frp.creatorblue.com/sp", //
    tokenAPI: "wx/api/sessionid", //token服务接口名,可以和url组合成完整的URL，也可以是一个独立的URL，当为＂＂时，表示没有指定服务
    getUserAPI : "wx/api/trainee/getTraineeInfo",//用户信息服务接口名
    downladFilePath:"",//文件下载路径
    uploadFieldName:"file",//文件上传表单域的名称
  },
  operState: {//操作状态
    tokenLock: false, //token的获取需要同步操作，设置同步锁状态，默认为未锁定
    intervalTime : 10,//轮询服务的时间间隔
    duration : 3000, //吐息显示的时间长度，单位毫秒
    msgIntervalTime:5,//消息间隔显示时间，单位分钟
  }
}

