const msg = require("msg.js");
const stringUtil = require("stringutil.js");
const globalData = require("globaldata.js");
const dialogUtil = require("dialogutil.js");

/**
 * 获取图片路径
 */
const concatImgUrl = function (url) {
  if (url) {
    if (!stringUtil.contains(url, "http") && !stringUtil.startWith(url, "data:image/svg+xml,")  && !stringUtil.startWith(url, "iconfont")) {
      if (!stringUtil.startWith(url, '/')) {
        url = '/' + url
      }
      url = globalData.serverInfo.imgUrl + url;
    }
  }
  return url;
}
/**
 * 获取路径
 */
const concatUrl = function(url){
  if(!stringUtil.trim(url) ){
    dialogUtil.showToast({ title: '请指定服务的路径' })
    return false;
    //throw new Error("请指定服务的路径");
  }else{
    if (!stringUtil.contains(url, "://")) {
      url = globalData.serverInfo.url + url;
    }
  }
  return url;
}

/**
 * 为url拼接get参数
 */
const concatParam = function(url,data){
  let param = "";
  if(stringUtil.eq(typeof(data),"object" )){//如果是json对象,则转成字符串参数
    for(let i in data){
      param += "&" + i + "=" + data[i];
    }
    param = param.substring(1);
  }else{
    param = data;
  }
  if(stringUtil.contains(url,"?")){
    url += "&" + param;
  }else{
    url + "?" + param;
  }
  return url;
}


function LocalData() { }
/**
 * 获取本地存储的数据
 */
LocalData.prototype.getData = function (key) {
  let value = wx.getStorageSync(key);
  if (!value) {
    value = null;
  } else if (stringUtil.startWith("{") || stringUtil.startWith("[") == 0) {
    value = typeof value == 'string' ? JSON.parse(value) : value;
  }
  return value;
}
/**
 * 把数据缓存到本地存储
 */
LocalData.prototype.setData = function (key, value) {
  if (typeof (value) == "object") {
    value = JSON.stringify(value);
  }
  wx.setStorageSync(key, value);
}
/**
 * 删除 本地存储
 */
LocalData.prototype.removeData = function (key) {
  let value = wx.getStorageSync(key);
  if(value){
    wx.removeStorageSync(key);
  }
}
const localData = new LocalData();

/**
 * 服务失败时的回调方法
 */
const fail = function (callback,params){
  if (!callback || stringUtil.nq(typeof (callback), "function")) {
    callback = function () { };
  }
  return function (res1) {
    if(params && params.isShowLoading ){
      wx.hideLoading()
    }
    callback(res1)
    if (res1.errMsg) {
      if(res1.errMsg == 'uploadFile:fail abort'){
        dialogUtil.showToast({ title: '终止上传' })
      }else if((res1.errMsg == 'chooseVideo:fail cancel') || (res1.errMsg == 'chooseVideo:fail user canceled') || (res1.errMsg == 'chooseImage:fail cancel') || (res1.errMsg == 'chooseMessageFile:fail cancel')){
        // dialogUtil.showToast({ title: '取消选择' })
      }else if(res1.errMsg == 'request:fail timeout'){
        dialogUtil.showToast({ title:'请求超时，请检测网络' })
      }else{
        dialogUtil.showToast({ title: res1.errMsg })
      }
    } else {
      let e = msg.request_exception
      dialogUtil.showToast({ title: e.msg })
    }
  }
}
/**
 * 服务请求的回调
 */
const complete = function (callback,params){
  
  if (!callback || stringUtil.nq(typeof (callback), "function")) {
    callback = function () { };
  }
  return function (res1) {
    
    callback(res1)
  }
}

/**
 * 服务成功时的回调方法
 */
const success = function (callback,params){
  if (!callback || stringUtil.nq(typeof (callback), "function")){
    callback = function(){};
  }
  return function(res1){
    if(params.isShowLoading){
      wx.hideLoading()
    }
    if (res1.statusCode == 404) {
      dialogUtil.showToast({ title: '网络请求失败' })
    }
    let res1data = ( (res1.data) && (typeof (res1.data) == 'string') && (!stringUtil.startWith(res1.data,'<')) ) ? (JSON.parse(res1.data)) :(res1.data);
    if (res1data && res1data.code){
      if (res1data.code != 0) {

        if (res1data.msg && params.isSucShowToast) {
          dialogUtil.showToast({ title: res1data.msg })
        } else if (res1data.error && params.isSucShowToast) {
          dialogUtil.showToast({ title: res1data.error })
        }
        if (res1data.code == 401 || (params.isExtraJudgeToken && res1data.code == 403)  || res1data.code == -1 || (res1data.msg && stringUtil.contains(res1data.msg,'无效的token')) ) {//如果服务返回  无效的token，就返回登录页,
          if(params.isSucShowToast){
            dialogUtil.showToast({ title: '无效的token，请重新授权' })
          }
          globalData.userInfo.state = "1"
          globalData.userInfo.hasUserInfo = false
          globalData.userInfo.token = null
          localData.setData("userInfo", null)
          wx.reLaunch({  url: '/pages/tabbar/home/home', })
            // wx.switchTab({ url: '/pages/tabbar/home/home' })
        }
      }
      if (res1data.code == 0 || params.isReturn) {
        callback(res1);
      }
    }else{
      callback(res1)
    }
  }
  
}


/**
 * 网络数据请求
 */
const request = function (params = {}) {

  params.url = concatUrl(params.url);

  //转圈圈的文字描述
  if (params.showLoadingLabel == undefined) {
    params.showLoadingLabel = '正在加载中……';
  }
  //是否出现转圈圈
  let isShowLoading = true;
  if (params.isShowLoading && params.isShowLoading == 'false') {
    isShowLoading = false;
  }
  if(isShowLoading){
    wx.showLoading({ title: params.showLoadingLabel ,mask:true})
  }
  params.isShowLoading = isShowLoading;
  // 是否 403的时候 判断 无效的token
  if (params.isExtraJudgeToken == undefined) {
    params.isExtraJudgeToken = false;
  }
  //初始化参数
  //成功时是否返回提示信息
  if (params.isSucShowToast == undefined) {
    params.isSucShowToast = true;
  }
  //默认返回数据
  if (params.isReturn == undefined) {
    params.isReturn = true;
  }
  //异步调用，暂不支持同步
  if (params.asyc == undefined) {
    params.asyc = true;
  }
  //默认请求时必须带有用户唯一编码
  if (params.needToken == undefined) {
    params.needToken = true;
  }
  //默认返回类型为json
  if (params.dataType == undefined) {
    params.dataType = "json";
  }
  //默认请求方法为post
  if (params.method == undefined) {
    params.method = "POST";
  } else {
    params.method = params.method.toUpperCase();
  }
  //设置默认的请求头
  if (params.header == undefined) {
    params.header = {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    }
  }
  //默认请求时必须带有用户唯一编码
  if (params.needToken == undefined) {
    params.needToken = true;
  }
  //设置默认回调函数
  //服务访问成功后处理，如果返回值不为0，则显示提示信息，否则如果需要返回数据，则调用回调函数
  params.success = success(params.success, params);

  //如果服务访问失败，则提示预设异常
  if (!params.fail || stringUtil.nq(typeof (params.fail), "function")) {
    params.fail = fail(params.fail, params);
  }
  //全局处理函数，无论成功或失败都会调用此函数
  params.complete = complete(params.complete, params);
  //服务访问时请求的数据
  if (params.data == undefined) {
    params.data = {};
  }
  //如果需要token，则取得token后再调用
  if (params.needToken) {
    //获取tokne,并在加调方法中执行操作
    getToken(function (token) {
      if(params.data && typeof(params.data) != 'string'){
        params.data.token = token;
      }
      // params.data.token = '606ebd30-e9f1-4f44-9667-0ea32148bb72'
        req(params);
    });
  } else {//如果不需要token，则直接调用
      req(params);  
  }
}

//向服务器发送请求
const req = function (params) {
  try {
    let task = wx.request({
      url: params.url,
      data: params.data,
      method: params.method,
      header: params.header,
      dataType: params.dataType,
      success: params.success,
      fail: params.fail,
      complete: params.complete
    })
  /*  task.onHeadersReceived(function(res){
      log(res);
    });*/
  } catch (e) {
    params.fail(e,params);
  }
}
/**
 * 选择图片
 */
const chooseImage = function (params = {}) {
  //转圈圈的文字描述
  if (params.showLoadingLabel == undefined) {
    params.showLoadingLabel = '选择图片中……';
  }
  //是否出现转圈圈
  let isShowLoading = true;
  if (params.isShowLoading && params.isShowLoading == 'false') {
    isShowLoading = false;
  }
  if(isShowLoading){
    wx.showLoading({ title: params.showLoadingLabel ,mask:true})
  }
  params.isShowLoading = isShowLoading;
  //初始化参数
  //成功时是否返回提示信息
  if (params.isSucShowToast == undefined) {
    params.isSucShowToast = true;
  }
  //默认最多可以选择的文件个数9
  if (params.count == undefined) {
    params.count = 9;
  }
  //默认所选的图片的尺寸
  if (params.sizeType == undefined) {
    params.sizeType = ['original', 'compressed'];
    // params.sizeType = ['original'];
  }
  //设置选择图片的来源
  if (params.sourceType == undefined) {
    params.sourceType = ['album', 'camera'];
    // params.sourceType = ['camera'];
  }
  //设置默认回调函数
  //服务访问成功后处理，如果返回值不为0，则显示提示信息，否则如果需要返回数据，则调用回调函数
  params.success = success(params.success, params);

  //如果服务访问失败，则提示预设异常
  if (!params.fail || stringUtil.nq(typeof (params.fail), "function")) {
    params.fail = fail(params.fail, params);
  }
  //全局处理函数，无论成功或失败都会调用此函数
  params.complete = complete(params.complete, params);
  chooseImg(params);
}

//向服务器发送请求
const chooseImg = function (params) {
  try {
    let task = wx.chooseImage(params)
  } catch (e) {
    params.fail(e,params);
  }
}
/**
 * 选择图片，视频，文件
 */
const chooseMessageFile = function (params = {}) {
  //转圈圈的文字描述
  if (params.showLoadingLabel == undefined) {
    params.showLoadingLabel = '选择文件中……';
  }
  //是否出现转圈圈
  let isShowLoading = true;
  if (params.isShowLoading && params.isShowLoading == 'false') {
    isShowLoading = false;
  }
  if(isShowLoading){
    wx.showLoading({ title: params.showLoadingLabel ,mask:true})
  }
  params.isShowLoading = isShowLoading;

  //初始化参数
  //成功时是否返回提示信息
  if (params.isSucShowToast == undefined) {
    params.isSucShowToast = true;
  }
  //默认最多可以选择的文件个数9
  if (params.count == undefined) {
    params.count = 9;
  } 
  //设置默认的所选的文件的类型
  //all:从所有文件选择;video:只能选择视频文件;image:只能选择图片文件;file:可以选择除了图片和视频之外的其它的文件
  if (params.type == undefined) {
    params.type = 'all';
  }
  //设置默认 根据文件拓展名过滤，仅 type==file 时有效。每一项都不能是空字符串。默认不过滤
  if (params.extension == undefined) {
    delete params.isExtension;
  }
  //设置默认回调函数
  //服务访问成功后处理，如果返回值不为0，则显示提示信息，否则如果需要返回数据，则调用回调函数
  params.success = success(params.success, params);

  //如果服务访问失败，则提示预设异常
  if (!params.fail || stringUtil.nq(typeof (params.fail), "function")) {
    params.fail = fail(params.fail, params);
  }
  //全局处理函数，无论成功或失败都会调用此函数
  params.complete = complete(params.complete, params);
  chooseImgFile(params);
}

//向服务器发送请求
const chooseImgFile = function (params) {
  try {
    let task = wx.chooseMessageFile(params)
  } catch (e) {
    params.fail(e,params);
  }
}
/**
 * 选择视频
 */
const chooseVideo = function (params = {}) {
  //转圈圈的文字描述
  if (params.showLoadingLabel == undefined) {
    params.showLoadingLabel = '选择视频中……';
  }
  //是否出现转圈圈
  let isShowLoading = true;
  if (params.isShowLoading && params.isShowLoading == 'false') {
    isShowLoading = false;
  }
  if(isShowLoading){
    wx.showLoading({ title: params.showLoadingLabel ,mask:true})
  }
  params.isShowLoading = isShowLoading;
  //初始化参数
  //成功时是否返回提示信息
  if (params.isSucShowToast == undefined) {
    params.isSucShowToast = true;
  }
  //设置视频选择的来源
  if (params.sourceType == undefined) {
    params.sourceType = ['album', 'camera'];
  }
  //是否压缩所选择的视频文件
  if (params.compressed == undefined) {
    params.compressed = true;
  }
  //拍摄视频最长拍摄时间，单位秒
  if (params.maxDuration == undefined) {
    params.maxDuration = 60;
  }
  //默认拉起的是前置或者后置摄像头。部分 Android 手机下由于系统 ROM 不支持无法生效
  //back:默认拉起后置摄像头;front:	默认拉起前置摄像头
  if (params.camera == undefined) {
    params.camera = 'back';
  }
  //设置默认回调函数
  //服务访问成功后处理，如果返回值不为0，则显示提示信息，否则如果需要返回数据，则调用回调函数
  params.success = success(params.success, params);

  //如果服务访问失败，则提示预设异常
  if (!params.fail || stringUtil.nq(typeof (params.fail), "function")) {
    params.fail = fail(params.fail, params);
  }
  //全局处理函数，无论成功或失败都会调用此函数
  params.complete = complete(params.complete, params);
  chooseVideoRequst(params);
}

//向服务器发送请求
const chooseVideoRequst = function (params) {
  try {
    let task = wx.chooseVideo(params)
  } catch (e) {
    params.fail(e,params);
  }
}
/**
 * 文件下载
 */
const downloadFile = function (params = {}){
  params.url = concatUrl(params.url);
  //转圈圈的文字描述
  if (params.showLoadingLabel == undefined) {
    params.showLoadingLabel = '文件下载中……';
  }
  //是否出现转圈圈
  let isShowLoading = true;
  if (params.isShowLoading && params.isShowLoading == 'false') {
    isShowLoading = false;
  }
  if(isShowLoading){
    wx.showLoading({ title: params.showLoadingLabel ,mask:true})
  }
  params.isShowLoading = isShowLoading;
  if (params.header && params.header.Referer) { //文件下载，Header 中不能设置 Referer
    delete params.header.Referer;
  }
  //成功时是否返回提示信息
  if (params.isSucShowToast == undefined) {
    params.isSucShowToast = true;
  }
  //默认请求时必须带有用户唯一编码
  if (params.needToken == undefined) {
    params.needToken = true;
  }
  // 是否 403的时候 判断 无效的token
  if (params.isExtraJudgeToken == undefined) {
    params.isExtraJudgeToken = false;
  }
  

  // if (!params.filePath){//文件下载路径，如果未指定，则使用系统设置的路径，如果系统未设置下载路径 ，则抛出异常
  //   let filePath = globalData.serverInfo.downladFilePath;
  //   if(!filePath){
  //     throw Error("未设置下载保存路径");
  //   }
  //   params.filePath = filePath;
  //   dialogUtil.showToast({ title: '请指定下载路径' })
  //   return false;
  // }
  //如果服务访问失败，则提示预设异常
  if (!params.fail || stringUtil.nq(typeof (params.fail), "function")) {
    params.fail = fail(params.fail, params);
  }
  //全局处理函数，无论成功或失败都会调用此函数
  params.complete = complete(params.complete, params);
  params.success = success(params.success, params);
  if (params.data){
    params.url = concatParam(params.url,data);
  }
  //如果需要token，则取得token后再调用
  if (params.needToken) {
    //获取tokne,并在加调方法中执行操作
    getToken(function (token) {
      params.url = concatParam(params.url, "token=" + token);
      downReq(params);
    });
  } else {//如果不需要token，则直接调用
    downReq(params);
  }
}
const downReq = function(param){
  wx.downloadFile(param);
}
/**上传文件 */
const uploadFile = function (params,taskCallback= function () { }){
  //转圈圈的文字描述
  if (params.showLoadingLabel == undefined) {
    params.showLoadingLabel = '上传中……';
  }
  //是否出现转圈圈
  let isShowLoading = true;
  if (params.isShowLoading && params.isShowLoading == 'false') {
    isShowLoading = false;
  }
  if(isShowLoading){
    wx.showLoading({ title: params.showLoadingLabel ,mask:true})
  }
  params.isShowLoading = isShowLoading;
  params.url = concatUrl(params.url);//文件上传的服务路径
  if (!params.filePath){
    dialogUtil.showToast({ title: '必须指定需要上传的文件的路径' })
    return false;
  }
  //成功时是否返回提示信息
  if (params.isSucShowToast == undefined) {
    params.isSucShowToast = true;
  }
  // 是否 403的时候 判断 无效的token
  if (params.isExtraJudgeToken == undefined) {
    params.isExtraJudgeToken = false;
  }

  if (!params.name){//文件域的名称
    params.name = globalData.serverInfo.uploadFieldName;
  }
  
  if (params.header && params.header.Referer) {//Header 中不能设置 Referer
    delete params.header.Referer;
  }
  if (!params.formData){
    params.formData = {};
  }
  //默认请求时必须带有用户唯一编码
  if (params.needToken == undefined) {
    params.needToken = true;
  }
  //如果服务访问失败，则提示预设异常
  if (!params.fail || stringUtil.nq(typeof (params.fail), "function")) {
    params.fail = fail(params.fail, params);
  }
  //全局处理函数，无论成功或失败都会调用此函数
  params.complete = complete(params.complete, params);
  params.success = success(params.success,params);
  //如果需要token，则取得token后再调用
  if (params.needToken) {
    //获取tokne,并在加调方法中执行操作
    getToken(function (token) {
      params.formData.token = token;
      upladReq(params,function(task){
        taskCallback(task)
      });
    });
  } else {//如果不需要token，则直接调用

    upladReq(params,function(task){
      taskCallback(task)
    });

  }
}
const upladReq = function(param,taskCallback=function(){}){
  try{
    const uploadTask = wx.uploadFile(param);
    taskCallback(uploadTask);
  }catch(e){
    param.fail(e);
  }
}

const getToken = function (callbackGetToken = function () { }, isflush = false){
  //进入时立即锁定获取状态
  var getTokenInteval = setInterval(function () {
    if (globalData.operState.tokenLock == false) {//先锁定同步，如果此时已锁定，则等待其它操作完成
      globalData.operState.tokenLock = true;
      clearInterval(getTokenInteval);//停止等待
      var token = globalData.userInfo.token;
      //如果不刷新，并且已取得了token，则返回token并解除锁定
      if (!isflush && token) {
        globalData.operState.tokenLock = false;
        callbackGetToken(token);
        return;
      }else{ //如果要刷新token或无token，则向服务器请求新的token
        let data = { 
          code: globalData.userInfo.code,
          usertype: '1'
        };
        if(globalData.userInfo && globalData.userInfo.province){
          data.province = globalData.userInfo.province
        }
        if(globalData.userInfo && globalData.userInfo.city){
          data.city = globalData.userInfo.city
        }
        if(globalData.userInfo && globalData.userInfo.avatarUrl){
          data.avatarUrl = globalData.userInfo.avatarUrl
        }

        if(globalData.userInfo && globalData.userInfo.nickName){
          data.nickName = globalData.userInfo.nickName
        }
        if(globalData.userInfo && globalData.userInfo.userType){
          data.usertype = globalData.userInfo.userType
        }
        if(globalData.userInfo && globalData.userInfo.gender){
          data.sex = globalData.userInfo.gender
        }
        if(globalData.userInfo && globalData.userInfo.country){
          data.country = globalData.userInfo.country
        }
        if (token){
          data.oldToken = token;
        }
        if(!data.code){
          globalData.operState.tokenLock  = false;
          return false;
        }

        request({ 
          url: globalData.serverInfo.tokenAPI, 
          isSucShowToast:false,
          success: function (res1) {
            if (res1.data.code == 0){
              globalData.userInfo.token = res1.data.userToken;
              globalData.userInfo.state = res1.data.state;
              globalData.userInfo.userType = res1.data.type;
              // globalData.userInfo = Object.assign(globalData.userInfo,{});
              // token = res1.data.userToken;
              callbackGetToken(token);
            }
         }, 
          complete : function(){
            globalData.operState.tokenLock = false;
          },
          data: data,
          needToken: false});
      }
    }
  }, globalData.operState.intervalTime);
}


/**
 * 获取用户
 */
const getUserInfo = function (callback, isFlush = false) {
  let userInfo = globalData.userInfo;
  if (!userInfo.hasUserInfo) {//如果用户信息未加载，则服务器上获取
    if (!isFlush) {//如果不刷新缓存，则从本地存储中获取
      userInfo = localData.getData("userInfo");
    }
  } else {
    callback(userInfo);
  }
}
/**图片预览 */
const previewImage = function (urlArr, succallback){
  if (urlArr && urlArr.length>0){
    wx.previewImage({
      urls: urlArr, // 需要预览的图片http链接列表
      current: urlArr[0], //当前显示图片的链接
      success: function (e) {
        succallback(e)
      },
      fail:function(e){
        dialogUtil.showToast({ title: '图片预览失败' })
      }
    })
  }else{
    dialogUtil.showToast({ title: '图片不存在' })
  }
}
/**下载并打开文件 */
const downLoadAndLookFile = function (path,callback){
  if(path){
    downloadFile({
      url: path,
      showLoadingLabel:'文件打开中……',
      success: function (res) {
        if (res.statusCode == 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: function (res2) {
              if (res2.errMsg = "openDocument:ok") {
                dialogUtil.showToast({ title: '打开文件成功' })
              }
            },
            fail: function (res2) {
              if (res2.errMsg = "openDocument:fail file not exist") {
                dialogUtil.showToast({ title: '文件不存在' })
              }else{
                dialogUtil.showToast({ title: '文件打开失败' })
              }
            }
          })
        } else if (res.statusCode == 404){
          dialogUtil.showToast({ title: '文件不存在' })
        }
      },
      fail: function (res) {
        if (res.errMsg) {
          if (res.errMsg == "downloadFile:fail createDownloadTask:fail url not in domain list"){
            dialogUtil.showToast({ title: 'url不在downloadFile 合法域名列表中' })
          }else{
            dialogUtil.showToast({ title: res.errMsg })
          }
        }
      }
    })
  }else{
    dialogUtil.showToast({ title: '文件不存在' })
  }
}

/**从数据库中查找用户信息 */
const findUserInfoFromMysal = function (params,callback){
  let that = this
  let isShowLoading = 'true';
  if(params && params.isShowLoading == 'false'){
    isShowLoading = 'false';
  }
  request({
    isShowLoading:isShowLoading,
    url: globalData.serverInfo.getUserAPI,
    method: 'POST',
    success: function (suc) {
      if (suc && suc.data && suc.data.code == 0) {
        globalData.myInfo = suc.data.data;
        // localData.setData('myInfo', suc.data.data)
        callback(suc.data)
      }
    }
  })
}
/**返回页面，并调用要返回的页面的onLoad的方法 */
const backPageOnload = function (params={}){
  let num = 1;//默认返回一个页面
  if(params && params.num){//要返回几个页面
    num = params.num;
  }
  var pages = getCurrentPages(); // 当前页面
  var beforePage = pages[pages.length - (1 + num)]; // 前一个页面
  wx.navigateBack({
    delta:num,
    success: (res) => {
      beforePage.onLoad(); // 执行前一个页面的onLoad方法
    }
  })
}

/**活动等 上传附件 */
const activityUploadFile = function (params={},callback){
  
  let funType = 'image'
  if(params && params.funType){
    funType = params.funType;
  }
  
  if(funType == 'image'){
    chooseImage({
      isShowLoading:'false',
      success:function(res){
        let tempFiles = res.tempFilePaths;
        if (res.errMsg == 'chooseImage:ok'){
          let tempFilesArr = [];
          if(tempFiles && tempFiles.length>0){
            for(let a=0;a<tempFiles.length;a++){
    
              tempFilesArr.push({
                path:tempFiles[a],
                type:'image'
              })
            }
          }
          activityUploadFileSucComm(params,tempFilesArr,function(res2){
            callback(res2)
          });
        }
      }
    });
  }else if(funType == 'video'){
    chooseVideo({
      isShowLoading:'false',
      success:function(res){
        let tempFiles = res.tempFilePath;
        if (res.errMsg == 'chooseVideo:ok'){
          let tempFilesArr = [];
          if(tempFiles){
            tempFilesArr.push({
              path:tempFiles,
              type:'video',
              pathPic: (res.thumbTempFilePath)?(res.thumbTempFilePath):'',
            });
          }
          activityUploadFileSucComm(params,tempFilesArr,function(res2){
            callback(res2)
          });
        }
      }
    });
  }else{
    chooseMessageFile({
      isShowLoading:'false',
      type: funType,  //'file'  or  'all'
      success:function(res){
        let tempFilesArr = res.tempFiles;
        if(funType == 'all' && tempFilesArr && tempFilesArr.length>0){
          for(let a=0;a<tempFilesArr.length;a++){
            if(tempFilesArr[a].type == 'file'){
              dialogUtil.showToast({title:'只能上传图片和视频'});
              return false;
            }
          }
        }
        activityUploadFileSucComm(params,tempFilesArr,function(res2){
          callback(res2)
        });
      }
    });
  }
  

}
/**活动等 上传附件 的公共方法 */
const activityUploadFileSucComm = function(params={},tempFilesArr,callback){
  let url = 'wx/activity-api/brainstorming/upload';
  let name = 'file';
  if(params && params.url){
    url = params.url;
  }
  if(params && params.name){
    name = params.name;
  }
  let formData = {};
  if(params && stringUtil.objectIsNotNull(params.formData) ){
    formData = params.formData;
  }
  if(tempFilesArr && tempFilesArr.length>0){
    for(let a=0;a<tempFilesArr.length;a++){
      formData[name] = tempFilesArr[a].path;
      formData.fileName = (tempFilesArr[a].name)?(tempFilesArr[a].name):'';

      uploadFile({
        url: url,
        filePath: tempFilesArr[a].path,
        name: name,
        formData:formData,
        success: function (suc) {
          if (suc.statusCode == 200) {
            let ss = ((suc.data) && typeof (suc.data) == 'string') ? JSON.parse(suc.data) : (suc.data);
            if (ss.code == 0) {
              let pathArr = (tempFilesArr[a].path).split('.');
              if(pathArr[pathArr.length-1] == 'svg' || pathArr[pathArr.length-1] == 'SVG'){
                tempFilesArr[a].type = "file";
                if(!tempFilesArr[a].name){
                  tempFilesArr[a].name = pathArr[pathArr.length-2] + pathArr[pathArr.length-1]
                }
              }

              let result = {
                chooseMessageFileData:tempFilesArr[a],
                backstageData:ss
              }
              callback(result);
            }
          }
        }
      })
    }
  }
}

/**是否登录，如果登录则可以点击，否则不可以点击 */
const isCanInto = function(){
  // 是否注册了手机0注册1未注册
  if(globalData.userInfo.state && globalData.userInfo.state == '1'){
    dialogUtil.showToast({ title: '当前未登录，请先登录',mask:'true' });
    return false;
  }
  return true;
}

/**
 * 根据 activityType 和 activityPic来 转换 图标
 * @param activityType
 * @param activityPic
 * @returns {string}
 */
const getActivitySvg = function (activityType, activityPic) {
  var result = activityPic
  if (activityType && activityType === '1' && !activityPic) { // 投票/问卷
    result = 'iconfont_svg iconwenjuantiaocha'
  } else if (activityType && activityType === '6' && !activityPic) { // 课堂表现
    result = 'iconfont_svg iconketangbiaoxian'
  } else if (activityType && activityType === '8' && !activityPic) { // 签到
    result = 'iconfont_svg iconqiandao'
  } else if (activityType && activityType === '-1' && !activityPic) { // 通知，activityType类型暂时不知
    result = 'iconfont_svg iconxiaoxitongzhi'
  }
  return result
}
/**处理 一些与设备有关的全局变量 */
const getSystemInfoToHandleGlobalData = function (){
  wx.getSystemInfo({
    success: function (res){
      globalData.statusBarHeight = res.statusBarHeight;
      globalData.windowWidth = res.windowWidth;
      globalData.windowHeight = res.windowHeight;
      globalData.screenWidth = res.screenWidth;
      globalData.screenHeight = res.screenHeight;
      //wx.getSystemInfoSync().model是系统检测的手机型号；
      // 检测ios机型出现的第一个数字是否大于8，若大于8，则为底部导航有横条；（iPhone12目前检测有问题，但是检测到的第一个数字为‘iPhone13’中的13，自测是没有问题的，其他问题尚未发现）
      // iPhoneX型号特殊，需特殊判断；
      let isIphoneX = (res.model.indexOf("iPhone") == 0) && (res.model.indexOf("X") >= 0 || (res.model.match(/\d+/g) && res.model.match(/\d+/g)[0] > 8)) ? '0' : '-1';
      if(isIphoneX == '-1'){
        globalData.fixedBottom = 0;
      }else{
        globalData.fixedBottom = (res.screenHeight - res.safeArea.bottom );
      }
      // globalData.fixedBottom =  (res.screenHeight - res.safeArea.bottom );
      var isIos = res.system.indexOf('iOS') > -1;
      globalData.navigationBarHeight = isIos ? 44 : 48;
    }
  })
}

/**
 *  在onshow里面 判断是否授权 并清空全局变量
 * @param {*} sourceType 来源, 'home'来自首页,'baoming'来自我要报名
 * @param {*} sucBack 已授权要执行的方法
 * @param {*} errBack 未授权要执行的方法
 */
const judgeIsAuthorize = function (sourceType = 'home',sucBack=function(){},errBack=function(){}) {
  //获取code，判断是否授权
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (stringUtil.contains(res.errMsg,"ok")) {
        if (getUserInfo(function (res1) {
          globalData.userInfo = Object.assign(globalData.userInfo, res1);//合并用户信息
        }.bind(this)));
        globalData.userInfo.code = res.code;
      } 
    }
  })
  //判断是否授权
  if (globalData.userInfo.hasUserInfo && localData.getData("userInfo") && localData.getData("userInfo").state ){//已授权
    sucBack(true)
  }else{//未授权
    errBack()
  }

  //对全局变量进行处理
  globalData.paramsData.replyTraineeInfo = '';
  // globalData.paramsData.qrCodeOptionsData = {};
  globalData.paramsData.testActivityType = '';
  globalData.paramsData.pkgId = '';
  globalData.paramsData.ctId = '';
  globalData.paramsData.subjectId = '';
  if (sourceType != 'home') {
    globalData.paramsData.classType = '';
  }
  globalData.paramsData.classId = '';
  globalData.paramsData.courseListCurrJoiningRoom = {};
  globalData.paramsData.classroomState = '';
  globalData.paramsData.postId = '';
  globalData.paramsData.replyPages = '';
  globalData.paramsData.currEditActivity = {};
  globalData.paramsData.isAssistant = '';
  globalData.paramsData.permsList = [];
  globalData.paramsData.classroomIdentity = '';
}

/**
 *  微信授权弹窗点击确定 进行用户授权
 * @param {*} event 微信授权弹窗点击确定 进行用户授权 返回的数据
 * @param {*} sucBack 已授权要执行的方法
 * @param {*} errBack 未授权要执行的方法
 */
const authorizeGetUserInfoComm = function (event,sucBack=function(){},errBack=function(){}) {
  
  
    // 用户点击授权后，这里可以做一些登陆操作
    let that = this
    //授权成功
    if(stringUtil.contains(event.detail.errMsg,"ok")){
      let userInfo = globalData.userInfo;
      if(event.detail && event.detail.userInfo){//获取微信用户信息
        userInfo = Object.assign(globalData.userInfo, event.detail.userInfo);
      }
      //获取token
      getToken(function () {
        userInfo = Object.assign(globalData.userInfo, userInfo);
        userInfo.hasUserInfo = true;
        localData.setData("userInfo", globalData.userInfo);
        sucBack(true);
      });
      
    }else{//授权失败或者取消授权
      console.log('执行了authorizeGetUserInfoComm')
      globalData.userInfo.hasUserInfo = false;
      errBack()
    }
}

/**
 * 我要咨询 调用 wx.openCustomerServiceChat公共方法
 */
const openCustomerServiceChatComm = function () {
  wx.openCustomerServiceChat({
    extInfo:{url: globalData.consultingServiceInfo.extInfoUrl},
    corpId:  globalData.consultingServiceInfo.corpId,
    success(res) {}
  })
}



module.exports = {
  request : request,
  getToken : getToken,
  paramUtil: localData,
  getUserInfo: getUserInfo,
  downloadFile: downloadFile,
  uploadFile: uploadFile,
  chooseImage: chooseImage,
  chooseVideo: chooseVideo,
  chooseMessageFile: chooseMessageFile,
  concatImgUrl: concatImgUrl,
  downLoadAndLookFile: downLoadAndLookFile,
  previewImage: previewImage,
  findUserInfoFromMysal: findUserInfoFromMysal,
  backPageOnload:backPageOnload,
  activityUploadFile:activityUploadFile,
  activityUploadFileSucComm:activityUploadFileSucComm,
  isCanInto:isCanInto,
  getActivitySvg:getActivitySvg,
  getSystemInfoToHandleGlobalData:getSystemInfoToHandleGlobalData,
  judgeIsAuthorize: judgeIsAuthorize,
  authorizeGetUserInfoComm: authorizeGetUserInfoComm,
  openCustomerServiceChatComm: openCustomerServiceChatComm
}

