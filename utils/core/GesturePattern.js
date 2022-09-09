const dialogUtil = require("dialogutil.js");
const globalData = require("globaldata.js");
const stringUtil = require("stringutil.js");
/**
实现手势图案
 */
var GesturePattern = class {
  constructor(pageObj,option){
    this.pageObj = pageObj;//相当于 调用该js的页面的this对象
    this.canvasId = (option && option.canvasId)?(option.canvasId):'canvasId';//canvas的id，用于区分
    this.isUseNewCanvas =  (option && option.isUseNewCanvas)?( (option.isUseNewCanvas == 'true'?true:false) ):(stringUtil.compareVersion(wx.getSystemInfoSync().SDKVersion, '2.9.0') >= 0);//是否使用新的 Canvas 2D，值为string类型
    this.canvasOldPwd = (option && option.canvasOldPwd)?(option.canvasOldPwd):'';//旧密码
    this.touchCircleColor=(option && option.touchCircleColor)?(option.touchCircleColor):'#0033cc';//触摸点实心圆以及连线颜色
    this.circleColor=(option && option.circleColor)?(option.circleColor):'#d9d9d9';//虚心圆点颜色
    this.canvasWidth = (option && option.canvasWidth)?(option.canvasWidth):(wx.getSystemInfoSync().windowWidth);//画布宽度
    this.canvasHeight = (option && option.canvasHeight)?(option.canvasHeight):(this.canvasWidth);//画布高度
    this.onTouchEnd =  (option && option.onTouchEnd)?(option.onTouchEnd):( function(event){} );//触摸结束事件
    this.onSuccess =  (option && option.onSuccess)?(option.onSuccess):( function(event){} );//触摸成功事件
    this.canvasType =(option && option.canvasType)?(option.canvasType):'';//showPwd为显示密码,checkPwd为验证密码，为''时只显示圆点
    this.checkedSucColor=(option && option.checkedSucColor)?(option.checkedSucColor):'#00c203';//验证密码成功后虚心圆点颜色
    this.checkedErrColor=(option && option.checkedErrColor)?(option.checkedErrColor):'#e64340';//验证密码失败后虚心圆点颜色
    this.leastPwdNum = (option && option.leastPwdNum)?(option.leastPwdNum):3;//绘制最少的点的数量
    this.canvasTempFilePath = '';//canvas生成的图片

    this.createCanvasContext();//创建画布对象

  }
  /**触摸开始和触摸移动 的公共代码 */
  touchComm(event,type){
    let currGrid = event.changedTouches[0];
    let canvasLastArcList = this.canvasLastArcList;
    let canvasArcRadius = this.canvasArcRadius;
    if(type == 'start'){//触摸开始
      //当前还保留上一次的数据，则return
      if(canvasLastArcList && canvasLastArcList.length>0){
        return false;
      }
    }
    let arr = this.canvasAllArcList;
    if(type == 'move'){
      arr = this.canvasRestArcList;
    }
    for(let i=0;i<arr.length;i++){
      //判断当前点是否在圆里面  当前点的坐标减圆的中心点的坐标  的绝对值 与 半径 比较
      if(currGrid.x && ( Math.abs(currGrid.x- arr[i].x )< canvasArcRadius ) && currGrid.y && (Math.abs(currGrid.y- arr[i].y)< canvasArcRadius) ){
        if(type == 'start'){
          this.touchIsInCircle = true;
        }
        //绘制触摸点的实心圆
        this.drawSolidCircle(arr[i].x,arr[i].y,this.touchCircleColor);
        if(type == 'move'){//绘制 两点之间的折线
          this.drawLine(canvasLastArcList[canvasLastArcList.length-1],arr[i],this.touchCircleColor);
        }
        //在圆内，对列表数据进行跟换
        canvasLastArcList.push(arr[i]);
        this.canvasRestArcList.splice(i,1);
        break;
      }
    }
  }
  /**绑定事件 */
  bindEvent(){
    let currThis = this;
    /**触摸开始 */
    this.pageObj.onTouchStart = function (event) {
      if(currThis.canvasType == 'showPwd'){
        return false;
      }
      currThis.touchComm(event,'start');
    }
     /**触摸 移动 */
    this.pageObj.onTouchMove = function (event) {
      if(currThis.touchIsInCircle){
        currThis.touchComm(event,'move');
      }
    }
    /**触摸 结束 */
    this.pageObj.onTouchEnd = function (event) {
      if(currThis.touchIsInCircle){
        currThis.touchIsInCircle = false;
        currThis.canvasPwd = '';
        currThis.canvasLastArcList.forEach((item,index)=>{
          currThis.canvasPwd += item.index;
        });
        let backObj={
          backEvent:event,
          canvasPwd:currThis.canvasPwd
        };
        currThis.onTouchEnd(backObj);
        let success = true;
        if(currThis.canvasType == '' && currThis.canvasPwd && currThis.canvasPwd.length <currThis.leastPwdNum){
          success = false;
          dialogUtil.showToast({ title: '图案绘制至少'+stringUtil.convertToChinese(currThis.leastPwdNum)+'个点，请重新绘制' });
          currThis.drawLastArcStrokeStyle(currThis.checkedErrColor);
          setTimeout(function(){
            currThis.canvasLastArcList = [];
            currThis.canvasInit();
          },globalData.operState.duration);
        }
        if(currThis.canvasType == 'checkPwd' && currThis.canvasOldPwd){
          if(currThis.canvasPwd == currThis.canvasOldPwd){
            success = true;
            backObj.eType = 'checkPwdSuc';
            currThis.drawLastArcStrokeStyle(currThis.checkedSucColor);
          }else{
            success = false;
            dialogUtil.showToast({ title: '图案绘制错误，请重新绘制' });
            currThis.drawLastArcStrokeStyle(currThis.checkedErrColor);
            setTimeout(function(){
              currThis.canvasLastArcList = [];
              currThis.canvasInit();
            },globalData.operState.duration);
          }
        }
        if(success){
          currThis.onSuccess(backObj);
        }
      }
    }
  }
  
  /**创建 canvas 绘图上下文（指定 canvasId） */
  createCanvasContext(){
    wx.showLoading({ title: '正在加载', mask:true })
    let that = this;
    // 创建 canvas 绘图上下文（指定 canvasId）
    if(!this.isUseNewCanvas){//采用旧版本 的canvas
      this.createCanvasContext = wx.createCanvasContext(this.canvasId, this);
      this.canvasInit();
      this.bindEvent();
    }else{
      let query = wx.createSelectorQuery().in(this.pageObj);
      // this.pageObj.
      query.select('#'+this.canvasId).fields({ node: true, size: true }).exec((res) => {
        let canvas = res[0].node
        // canvas.width = that.canvasWidth
        // canvas.height = that.canvasHeight
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        
        that.createCanvasContext = canvas.getContext('2d')
        that.createCanvasContext.scale(dpr, dpr)

        that.canvasInit();
        that.bindEvent();
      })
    }
    wx.hideLoading();
  }
  /**初始化  */
  canvasInit(){
    let createCanvasContext = this.createCanvasContext;
    this.canvasAllArcList=[];//记录所有点的坐标和index 的列表数据
    this.canvasLastArcList=[];//记录已经触摸了的点的坐标和index 的列表数据
    this.canvasRestArcList=[];//记录还没有触摸的点的坐标和index 的列表数据
    this.canvasPwd='';//密码
    this.touchIsInCircle=false;//最开始的触摸点是否在圆内，在才可以进行下一步操作
    this.canvasArcRadius='';//每个园的半径
    this.createCircles();
  }
  /**计算圆半径  */
  createCircles(){
    let createCanvasContext = this.createCanvasContext;
    //将当前画布的宽度分成  ( n*2+1 ) 份，相当于 ( n*2+1 ) 个园，每一个园前面都有一个隐藏的圆空间
    let n=3;//一行几个圆
    let count = 0;//园的下标
    this.canvasArcRadius = (this.canvasWidth) / ( (n*2+1)*2 );//计算半径
    let canvasArcRadius = this.canvasArcRadius;
    //得到每个园的圆心坐标以及index
    for(let i=0;i<n;i++){//外循环 相当于Y轴 
      for(let j=0;j<n;j++){//内循环,创建 n*n个园 相当于x轴 
        count ++;
        let obj = {//第一个圆前面有一个隐藏圆，第二个圆前面有（一个隐藏圆，一个圆），第三个圆前面有（两个隐藏圆，两个圆），
          x: j*4*canvasArcRadius +  3*canvasArcRadius,
          y: i*4*canvasArcRadius +  3*canvasArcRadius,//第二行第一个圆i= 1 ，j= 0
          index:count // 下标
        };
        this.canvasAllArcList.push(obj);
        this.canvasRestArcList.push(obj);
      }
    }
    //清除画布上的内容
    createCanvasContext.clearRect(0,0,this.canvasWidth,this.canvasHeight);//x,y,width,height
    //绘制n个虚心圆
    this.canvasAllArcList.forEach((item,index)=>{
      this.drawCircle(item.x,item.y,this.circleColor);
    });
    //渲染旧密码
    if(this.canvasType == 'showPwd'){
      if(this.canvasOldPwd){
        let arrc = this.canvasOldPwd.split('');
        arrc.forEach((item,index)=>{
          this.drawSolidCircle(this.canvasAllArcList[item-1].x,this.canvasAllArcList[item-1].y,this.touchCircleColor);
          if(index-1 >= 0){
            this.drawLine(this.canvasAllArcList[ arrc[index-1]-1 ],this.canvasAllArcList[item-1],this.touchCircleColor);
          }
        });
      }
      
    }
    
  }
  /**重新绘制 已触摸圆 的线条颜色 */
  drawLastArcStrokeStyle(color){
    this.canvasLastArcList.forEach((item,index)=>{
      this.drawCircle(item.x,item.y,color);
    });
  }
  //绘制虚心圆
  drawCircle(x,y,color){
    let createCanvasContext = this.createCanvasContext;
    let canvasArcRadius = this.canvasArcRadius;
    if(!this.isUseNewCanvas){//旧版本
      //设置描边颜色
      createCanvasContext.setStrokeStyle(color);
      //设置线条的宽度、粗细，单位px
      createCanvasContext.setLineWidth(1);
    }else{//2d方式 canvas
      //设置描边颜色
      createCanvasContext.strokeStyle = color;
      //设置线条的宽度、粗细，单位px
      createCanvasContext.lineWidth=1;
    }
    // 开始创建一个路径，需要调用fill或者stroke才会使用路径进行填充或描边
    createCanvasContext.beginPath();
    //x,y,r,startAngle,endAngle,弧度的方向是否是逆时针 ；Math.PI*2是一个圆相当于2π
    createCanvasContext.arc(x,y,canvasArcRadius,0,Math.PI*2,true);
    createCanvasContext.closePath();
    createCanvasContext.stroke();
    //将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中,reserve本次绘制是否接着上一次绘制
    let that = this;
    if(!this.isUseNewCanvas){//旧版本
      createCanvasContext.draw(true,function(){
        wx.canvasToTempFilePath({
          canvasId: that.canvasId,
          success(res) {
            that.canvasTempFilePath = (res && res.tempFilePath)?(res.tempFilePath):'';
          }
        },that);
      });
    }else{
      let query = wx.createSelectorQuery().in(this.pageObj);
      query.select('#'+this.canvasId).fields({ node: true, size: true }).exec((res) => {
        that.canvasTempFilePath = (res[0] && res[0].node && res[0].node.toDataURL('image/png'))?(res[0].node.toDataURL('image/png')):'';
      })
    }
  }
  /**重新设置 */
  reset(){
    this.canvasType = '';
    this.canvasLastArcList = [];
    this.canvasInit();
  }
  /** 绘制触摸点的实心圆 */
  drawSolidCircle(x,y,color){
    let createCanvasContext = this.createCanvasContext;
    let canvasArcRadius = this.canvasArcRadius;
    if(!this.isUseNewCanvas){//旧版本
      //设置填充颜色
      createCanvasContext.setFillStyle(color);
      //设置线条的宽度、粗细，单位px
      createCanvasContext.setLineWidth(1);
    }else{//2d方式 canvas
      //设置填充颜色
      createCanvasContext.fillStyle = color;
      //设置线条的宽度、粗细，单位px
      createCanvasContext.lineWidth=1;
    }
    
    // 开始创建一个路径，需要调用fill或者stroke才会使用路径进行填充或描边
    createCanvasContext.beginPath();
    //x,y,r,startAngle,endAngle,弧度的方向是否是逆时针 ；Math.PI*2是一个圆相当于2π
    createCanvasContext.arc(x,y,canvasArcRadius/2,0,Math.PI*2,true);
    createCanvasContext.closePath();
    createCanvasContext.fill();
    //将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中,reserve本次绘制是否接着上一次绘制
    let that = this;
    if(!this.isUseNewCanvas){//旧版本
      createCanvasContext.draw(true,function(){
        wx.canvasToTempFilePath({
          canvasId: that.canvasId,
          success(res) {
            that.canvasTempFilePath = (res && res.tempFilePath)?(res.tempFilePath):'';
          }
        },that);
      });
    }else{
      let query = wx.createSelectorQuery().in(this.pageObj);
      query.select('#'+this.canvasId).fields({ node: true, size: true }).exec((res) => {
        that.canvasTempFilePath = (res[0] && res[0].node && res[0].node.toDataURL('image/png'))?(res[0].node.toDataURL('image/png')):'';
      })
    }
  }
  /**绘制 两点之间的折线 */
  drawLine(startGrid,endGrid,color){
    let createCanvasContext = this.createCanvasContext;
    if(!this.isUseNewCanvas){//旧版本
      //设置描边颜色
      createCanvasContext.setStrokeStyle(color);
      //设置线条的宽度、粗细，单位px
      createCanvasContext.setLineWidth(2);
    }else{//2d方式 canvas
      //设置填充颜色
      createCanvasContext.strokeStyle = color;
      //设置线条的宽度、粗细，单位px
      createCanvasContext.lineWidth=2;
    }

   
    // 开始创建一个路径，需要调用fill或者stroke才会使用路径进行填充或描边
    createCanvasContext.beginPath();
    //把路径移动到画布中的指定点，不创建线条。用 stroke 方法来画线条
    createCanvasContext.moveTo(startGrid.x,startGrid.y);
    //增加一个新点，然后创建一条从上次指定点到目标点的线。用 stroke 方法来画线条
    createCanvasContext.lineTo(endGrid.x,endGrid.y);



    
    // console.log('startGrid', startGrid)
    // console.log('endGrid', endGrid)

    // let arrowTop = {x:0,y:0}
    // let arrowBottom = {x:0,y:0}

    // let degree = 45;
    // arrowTop.x = Math.round(  (endGrid.x * Math.cos(degree * Math.PI / 180) + endGrid.y * Math.sin(degree * Math.PI / 180))  * 100) / 100 ;
    // arrowTop.y = Math.round(  (-endGrid.x * Math.sin(degree * Math.PI / 180) + endGrid.y * Math.cos(degree * Math.PI / 180))  * 100) / 100 ; 

    // //画上边箭头线
    // createCanvasContext.moveTo(arrowTop.x,arrowTop.y);
    // createCanvasContext.lineTo(endGrid.x,endGrid.y);
    // //画下边箭头线
    // createCanvasContext.lineTo(endGrid.x+20,endGrid.y+20);



    

    createCanvasContext.closePath();
    createCanvasContext.stroke();
    //将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中,reserve本次绘制是否接着上一次绘制
    let that = this;
    if(!this.isUseNewCanvas){//旧版本
      createCanvasContext.draw(true,function(){
        wx.canvasToTempFilePath({
          canvasId: that.canvasId,
          success(res) {
            that.canvasTempFilePath = (res && res.tempFilePath)?(res.tempFilePath):'';
          }
        },that);
      });
    }else{
      let query = wx.createSelectorQuery().in(this.pageObj);
      query.select('#'+this.canvasId).fields({ node: true, size: true }).exec((res) => {
        that.canvasTempFilePath = (res[0] && res[0].node && res[0].node.toDataURL('image/png'))?(res[0].node.toDataURL('image/png')):'';
      })
    }
  }
}
module.exports = GesturePattern;