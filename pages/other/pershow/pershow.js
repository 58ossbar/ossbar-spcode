// pages/other/pershow/pershow.js
const app = getApp();
const core = require("../../../utils/core/core.js")
import * as echarts from '../../../components/ec-canvas/echarts';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ctId:'',//课堂id
    traineeId:'',//用户id
    baseInfo:{},//基础信息
    performanceInfo:{},//课堂表现信息
    ec: { lazyLoad: true },//图表对象
    chartInfo:{},//图表信息
    chartArr: [] // 图表数组
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.traineeId = (options && options.traineeId)?(options.traineeId):'';

    this.data.ctId = (core.globalData.paramsData.ctId) ? (core.globalData.paramsData.ctId):'';
    this.setData({
      traineeId:this.data.traineeId,
      ctId:this.data.ctId
    })
    this.viewTraineeBaseInfo();
    this.viewTraineeDetailInfo();
  },
  /**初始化 图表  仪表盘 图 */
  initGaugeChart:function(arr,arrName){
    let id = arr.id;  //'radar1';
    let that = this;
    // 获取组件
    this['ecComponent' + id] = this.selectComponent('#mychart-dom-' + id + '');
    this['ecComponent' + id].init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      let chart = 'chart' + id
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      let series1 = [];
      if (arr.series && arr.series.length > 0) {
        let max = Math.ceil((arr.series.length)/2);
        let part = 100/max/2;
        let radius =( max == 2)?(100/max - 10):(100/max);
        arr.series.forEach((item,index) => {
          let data1 = [];
          if (item.data && item.data.length > 0) {
            item.data.forEach((item1,index1) => {
              data1.push({
                value: item1.value,
                  name: item1.name,
                  title: {
                    offsetCenter: ['0%', '0%']
                  },
              });
            })
          }
          // let center = [(index%2 == 0)?'25%':'75%', (part*(index+1))+'%'];
          let center = ['75%', (part*(index))+'%'];
          if (index%2 == 0) {
            center = ['25%', (part*(index+1))+'%' ];
          }
          series1.push({
              name: item.name,
              type: 'gauge',
              radius: radius+'%',
              center: center,
              startAngle: 90,
              endAngle: -270,
              pointer: {
                show: false
              },
              progress: {
                show: true,
                overlap: false,
                roundCap: true,
                clip: false,
                itemStyle: {
                  borderWidth: 1,
                  // borderColor: '#464646'
                }
              },
              axisLine: {
                lineStyle: {
                  width: 15
                }
              },
              splitLine: {
                show: false,
                distance: 0,
                length: 10
              },
              axisTick: {
                show: false
              },
              axisLabel: {
                show: false,
                distance: 50
              },
              data: data1,
              title: {
                fontSize: 14
              },
              detail: {
                show: false,
                width: 50,
                height: 14,
                fontSize: 12,
                color: 'auto',
                borderColor: 'auto',
                borderRadius: 20,
                borderWidth: 1,
                formatter: '{value}%'
              }
          });
        })
      }
      let option = {
        backgroundColor:'#fff',
        color: ['#0033cc', '#11b928', '#fd7512', '#8878fd'],
        series: series1
      };
      chart.setOption(option);
      this['chart' + id] = chart;

      this['ecComponent' + id].canvasToTempFilePath({//获取canvas转成的图片
        success(res){
          arr.canvasTempFilePath = (res && res.tempFilePath)?(res.tempFilePath):''
          that.setData({
            [arrName+'.canvasTempFilePath']:arr.canvasTempFilePath
          })
        }
      })

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
    

  },
  /**初始化 图表  圆环图 */
  initRingChart:function(arr,arrName){
    let id = arr.id;  //'radar1';
    let that = this;
    // 获取组件
    this['ecComponent' + id] = this.selectComponent('#mychart-dom-' + id + '');
    this['ecComponent' + id].init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      let chart = 'chart' + id
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      let option = {
        tooltip: {
          confine:true,
          appendToBody: true,
          trigger: 'item',
          formatter: "{a} \n{b}: {c} ({d}%)",
        },
        backgroundColor:'#fff',
        legend: {
            icon:'circle',
            // right:'1%',
            top:'middle',
            right:'10',
            orient: 'vertical'
            // textStyle:{
            //   fontSize: 5
            // }
        },
        color: ['#0033cc', '#11b928', '#fd7512'],
        series:[
          {
            name:  arr.name,
            type: 'pie',
            left:'10',
            right:'30%',
            radius: ['30%', '50%'],
            // avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              // alignTo: 'edge',
              formatter: '{name|{b}}\n{time|{d}%}',
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                time: {
                  fontSize: 10,
                  color: '#999'
                }
              }
            },
            labelLine: {
              length: 15,
              length2: 0,
              maxSurfaceAngle: 80
            },
            labelLayout: function (params) {
              const isLeft = params.labelRect.x < chart.getWidth() / 2;
              const points = params.labelLinePoints;
              // Update the end point.
              points[2][0] = isLeft
                ? params.labelRect.x
                : params.labelRect.x + params.labelRect.width;
              return {
                labelLinePoints: points
              };
            },
            data: arr.data
          }
        ]
      };
      chart.setOption(option);
      this['chart' + id] = chart;

      this['ecComponent' + id].canvasToTempFilePath({//获取canvas转成的图片
        success(res){
          arr.canvasTempFilePath = (res && res.tempFilePath)?(res.tempFilePath):''
          that.setData({
            [arrName+'.canvasTempFilePath']:arr.canvasTempFilePath
          })
        }
      })

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
    

  },
  /**获取图表信息 */
  viewTraineeDetailInfo:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      traineeId:this.data.traineeId,
    };
    core.request({
      url: "wx/classroom-trainee-api/viewTraineeDetailInfo",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {

          that.data.chartArr = (res.data.data && res.data.data.length > 0) ? (res.data.data) : [];

          if (that.data.chartArr && that.data.chartArr.length > 0) {
            (that.data.chartArr).forEach((item, index) => {
              if (item.series && item.series.length > 1) {
                item.className = 'canvas3';
              } else {
                item.className = 'canvas2';
              }
              if (item && item.type == 'ring') {
                if(!item.id){
                  item.id = 'ring' + index;
                }
              } else  if (item && item.type == 'gauge') {
                if(!item.id){
                  item.id = 'gauge' + index;
                }
              }
            });
          }
          that.setData({
            chartArr: that.data.chartArr
          });

          if (that.data.chartArr && that.data.chartArr.length > 0) {
            (that.data.chartArr).forEach((item, index) => {
              if (item && item.type == 'ring') {
                that.initRingChart(item,'chartArr['+index+']');
              } else  if (item && item.type == 'gauge') {
                that.initGaugeChart(item,'chartArr['+index+']');
              }
            });
          }


         

        }
      }
    });
  },
  /**获取学员信息 */
  viewTraineeBaseInfo:function(){
    let that = this;
    let data = {
      ctId:this.data.ctId,
      traineeId:this.data.traineeId,
    };
    core.request({
      url: "wx/classroom-trainee-api/viewTraineeBaseInfo",
      method: "GET",
      data: data,
      success: function(res) {
        if (res.data.code === 0) {
          that.data.baseInfo = {};
          that.data.performanceInfo = {};
          if(core.stringUtil.objectIsNotNull(res.data.data) && core.stringUtil.objectIsNotNull(res.data.data.baseInfo) ){
            that.data.baseInfo = res.data.data.baseInfo;
            that.data.baseInfo.traineePic= core.concatImgUrl(that.data.baseInfo.traineePic);
          }
          if(core.stringUtil.objectIsNotNull(res.data.data) && core.stringUtil.objectIsNotNull(res.data.data.performanceInfo) ){
            that.data.performanceInfo = res.data.data.performanceInfo;
          }
          that.setData({
            baseInfo:that.data.baseInfo,
            performanceInfo:that.data.performanceInfo
          })
        }
      }
    });
  },
  /**初始化 图表  雷达图 */
  initChart:function(arr,arrName){
    let id = arr.id;  //'radar1';
    let that = this;
    // 获取组件
    this['ecComponent' + id] = this.selectComponent('#mychart-dom-' + id + '');
    this['ecComponent' + id].init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      let chart = 'chart' + id
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      let series1 = [];
      if(arr.series && arr.series.length>0){
        (arr.series).forEach((item,index) =>{
          series1.push({
            name:  item.name,
            type: 'radar',
            data: item.data
          })
        })
      }
      let option = {
        tooltip: {
          confine:true,
          formatter:function(params){
            let str = params.name+'\n';
            if(arr.radarIndicator && arr.radarIndicator.length>0){
              (arr.radarIndicator).forEach((item,index) =>{
                let name = (item.name).split('\n').join('');
                str += name + '：'+ ( (params.value[index])?(params.value[index]):0 ) +  ( (index < (arr.radarIndicator.length -1))?'\n':'' );
              });
            }
            return str;
          }
        },
        backgroundColor:'#fff',
        legend: {
            icon:'circle',
            data: arr.legendData, // ['TA的', '班课平均','优秀平均'],
            left:'1%',
            textStyle:{
              fontSize:13
            }
        },
        color: ['#0033cc', '#11b928', '#fd7512'],
        radar: {
            name: {
                textStyle: {
                    borderRadius: 3,
                }
            },
            startAngle:135,
            radius:'70%',
            center: ['50%', '50%'],
            indicator: arr.radarIndicator
        },
        series:series1
      };
      chart.setOption(option);
      this['chart' + id] = chart;

      this['ecComponent' + id].canvasToTempFilePath({//获取canvas转成的图片
      success(res){
        arr.canvasTempFilePath = (res && res.tempFilePath)?(res.tempFilePath):''
        that.setData({
          [arrName+'.canvasTempFilePath']:arr.canvasTempFilePath
        })
      }
    })

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
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
    core.globalData.paramsData.messagingType = '';
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