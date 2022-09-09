
const YEARLENGTH = 60+1;
const STARTYEAR = new Date().getFullYear() - 60;

const MONTHLENGTH = 12;
const STARTMONTH = 1;

const DAYLENGTH = 30;
const STARTDAY = 1;

const HOURLENGTH = 24;
const STARTHOUR = 0;

const MINUTELENGTH = 60;
const STARTMINUTE = 0;

const SECONDLENGTH = 60;
const STARTSECOND = 0;

let minDateStr =  `${STARTYEAR}-1-1 00:00:00`;
let maxDateStr = `${STARTYEAR+YEARLENGTH-1}-12-31 23:59:59`;

let defaultColumnsData  = createColumnsData({
  yearLength: YEARLENGTH,
  startYear: STARTYEAR,
  monthLength: MONTHLENGTH,
  startMonth: STARTMONTH,
  dayLength: DAYLENGTH,
  startDay: STARTDAY,
  hourLength: HOURLENGTH,
  startHour: STARTHOUR,
  minuteLength: MINUTELENGTH,
  startMinute: STARTMINUTE,
  secondLength: SECONDLENGTH,
  startSecond: STARTSECOND
});


const bigMonth = ['1月', '3月', '5月', '7月', '8月', '10月', '12月'];
const smallMonth = ['4月', '6月', '9月', '11月'];


function createColumnsData ({yearLength, startYear, monthLength, startMonth, dayLength, startDay,hourLength, startHour, minuteLength,startMinute, secondLength, startSecond }) {
  // let tempColumnsData  = [[],[],[]];
  let tempColumnsData  = [[],[],[],[],[],[]];
  tempColumnsData[0] = yearLength ? [...new Array(yearLength).keys()].map((v, i) => `${i + startYear}年`) : `${startYear}年`
  tempColumnsData[1] = monthLength ? [...new Array(monthLength).keys()].map((v, i) => `${i + startMonth}月`) : `${startMonth}月`
  tempColumnsData[2] = dayLength ? [...new Array(dayLength).keys()].map((v, i) => `${i + startDay}日`) : `${startDay}日`
  tempColumnsData[3] = hourLength ? [...new Array(hourLength).keys()].map((v, i) => `${i + startHour}时`) : `${startHour}时`
  tempColumnsData[4] = minuteLength ? [...new Array(minuteLength).keys()].map((v, i) => `${i + startMinute}分`) : `${startMinute}分`
  tempColumnsData[5] = secondLength ? [...new Array(secondLength).keys()].map((v, i) => `${i + startSecond}秒`) : `${startSecond}秒`
  return tempColumnsData;
}

/**  获取 从 startYear 到 startYear + yearLength 的 年份数组  */
function createStartYearColumnsData ({yearLength, startYear}) {
  let startYearColumnsData = yearLength ? [...new Array(yearLength + 1).keys()].map((v, i) => `${i + startYear}年`) : [`${startYear}年`]
  return startYearColumnsData;
}
/**  获取startMonth 以及之后的 月 份数组  */
function createStartMonthColumnsData ({startMonth}) {
  let startMonthColumnsData = startMonth === 12 ?  [`${startMonth}月`] : [...new Array(12 - startMonth + 1).keys()].map((v, i) => `${i + startMonth }月`)
  return startMonthColumnsData;
}
/** 获取 从 1月 到 endMonth月  个 月份  的 月份  数组 */
function createEndMonthColumnsData ({endMonth}) {
  let endMonthColumnsData = endMonth === 1 ?  [`${endMonth}月`] : [...new Array(endMonth).keys()].map((v, i) => `${i + 1}月`)
  return endMonthColumnsData;
}

/**  获取 startMonth开始月份 到  endMonth结束月份 的 月份数组 */
function createStartToEndMonthColumnsData ({startMonth,endMonth}) {
  let endMonthColumnsData =  [...new Array(endMonth - startMonth + 1).keys()].map((v, i) => `${i + startMonth}月`)
  return endMonthColumnsData;
}

/** 获取startDay  以及之后的 天数 数组  */
function createStartDayColumnsData ({startYear,startMonth, startDay}) {
  let tempTotalDay = 0;
  if(bigMonth.find((v) => parseInt(v) == startMonth)){ // 根据 startMonth 月份获取该月 的 天数
    tempTotalDay = 31;
  }else if(smallMonth.find((v) => parseInt(v) == startMonth)){
    tempTotalDay = 30;
  }else{
    tempTotalDay = 28;
    if(isLeapYear(startYear)){//如果 startYear 年是 闰年
      tempTotalDay = 29;
    }
  }
  let startDayColumnsData = startDay === tempTotalDay ? [`${startDay}日`] : [...new Array(tempTotalDay - startDay + 1).keys()].map((v, i) => `${i + startDay}日`)
  return startDayColumnsData;
}
/** 获取 从 1日到 endDay日 个 天数 的天数 数组 */
function createEndDayColumnsData ({endDay}) {
  let endDayColumnsData = endDay === 1 ? [`${endDay}日`] : [...new Array(endDay).keys()].map((v, i) => `${i + 1}日`)
  return endDayColumnsData;
}
/** 获取 从 0时 到 endMonth时  个 小时  的 小时  数组 */
function createEndHourColumnsData ({endHour }) {
  let endHourColumnsData = endHour === 0 ?  [`${endHour}时`] : [...new Array(endHour+1).keys()].map((v, i) => `${i}时`)
  return endHourColumnsData;
}
/** 获取 从 0分钟 到 endMinute分钟  个 分钟  的 分钟  数组 */
function createEndMinuteColumnsData ({endMinute }) {
  let endMinuteColumnsData = endMinute === 0 ?  [`${endMinute}分`] : [...new Array(endMinute+1).keys()].map((v, i) => `${i}分`)
  return endMinuteColumnsData;
}
/** 获取 从 0秒钟 到 endMonth秒钟  个 秒钟  的 秒钟 数组 */
function createEndSecondColumnsData ({endSecond }) {
  let endSecondColumnsData = endSecond === 0 ?  [`${endSecond}秒`] : [...new Array(endSecond+1).keys()].map((v, i) => `${i}秒`)
  return endSecondColumnsData;
}
/**  获取startDay 开始天数 到  endDay 结束天数 的 天数数组   */
function createStartToEndDayColumnsData ({startDay,endDay}) {
  let endDayColumnsData =  [...new Array(endDay - startDay + 1).keys()].map((v, i) => `${i + startDay}日`)
  return endDayColumnsData;
}
/**  获取 startHour 开始小时 到  endHour 结束小时 的 小时数组   */
function createStartToEndHourColumnsData ({startHour,endHour}) {
  let endHourColumnsData =  [...new Array(endHour - startHour + 1).keys()].map((v, i) => `${i + startHour}时`)
  return endHourColumnsData;
}
/**  获取 startMinute 开始分钟 到  endMinute 结束分钟 的 分钟数组   */
function createStartToEndMinuteColumnsData ({startMinute,endMinute}) {
  let endMinuteColumnsData =  [...new Array(endMinute - startMinute + 1).keys()].map((v, i) => `${i + startMinute}分`)
  return endMinuteColumnsData;
}
/**  获取 startSecond 开始秒 到  endSecond 结束秒 的 秒数组   */
function createStartToEndSecondColumnsData ({startSecond,endSecond}) {
  let endSecondColumnsData =  [...new Array(endSecond - startSecond + 1).keys()].map((v, i) => `${i + startSecond}秒`)
  return endSecondColumnsData;
}
/**  获取 startMinute 以及之后的 分钟 数组  */
function createStartMinuteColumnsData ({startMinute}) {
  let startMinuteColumnsData = startMinute === 59 ?  [`${startMinute}分`] : [...new Array(59 - startMinute + 1).keys()].map((v, i) => `${i + startMinute }分`)
  return startMinuteColumnsData;
}
/**  获取 startSecond 以及之后的 秒钟 数组  */
function createStartSecondColumnsData ({startSecond}) {
  let startSecondColumnsData = startSecond === 59 ?  [`${startSecond}秒`] : [...new Array(59 - startSecond + 1).keys()].map((v, i) => `${i + startSecond }秒`)
  return startSecondColumnsData;
}

/**  获取 startHour 以及之后的 时钟 数组  */
function createStartHourColumnsData ({startHour}) {
  let startHourColumnsData = startHour === 23 ?  [`${startHour}时`] : [...new Array(23 - startHour + 1).keys()].map((v, i) => `${i + startHour }时`)
  return startHourColumnsData;
}
/**  将 “ 从 startYear 到 startYear + yearLength 的 年份数组 ” 和 “ 获取startMonth 以及之后的 月 份数组” 以及 “ 获取startDay  以及之后的 天数 数组‘ 三个数组 联合起来  返回成一个数组 */
function createStartColumnsData ({yearLength, startYear, startMonth, startDay, startHour, startMinute, startSecond}) {
  let tempStartColumnsData = [[], [], [], [], [], []];
  tempStartColumnsData[0] = createStartYearColumnsData({yearLength, startYear})
  tempStartColumnsData[1] = createStartMonthColumnsData ({startMonth});
  tempStartColumnsData[2] =  createStartDayColumnsData ({startYear, startMonth, startDay});
  tempStartColumnsData[3] =  createStartHourColumnsData({startHour});
  tempStartColumnsData[4] =  createStartMinuteColumnsData({startMinute});
  tempStartColumnsData[5] =  createStartSecondColumnsData({startSecond});
  return tempStartColumnsData;
}
/** year 是否 是闰年  */
function isLeapYear(year) {
  return (year % 4 == 0 && year % 100 != 0) || year % 400 ==0;
}

Component({
  //一些组件选项
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    addGlobalClass: true //表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pickerType: {//选择器类型 ‘date’年月日，‘hour’年月日时，‘minute’年月日时分，‘second’年月日时分秒
      type: String,
      value: 'date', 
      observer: function (newVal) {
        this._setTempData();
      }
    },
    defaultDate:{//默认值，
      type: String,
      value: '',
      observer: function (newVal) {
        if (newVal === '' || this._compareDate()) return;
        this._setTempData();
        this._setDefault(newVal)
      }
    },
    startDate:{//开始年月日
      type: String,
      value: '',
      observer: function (newVal) {
        if (newVal === '' || this._compareDate()) return;
        this._setTempData();
        this._setDefault()
      }
    },
    endDate:{//结束年月日
      type: String,
      value: '',
      observer: function (newVal) {
        if (newVal === '' || this._compareDate()) return;
        this._setTempData();
        this._setDefault()
      }
    },
    isShowPicker:{//是否显示 picker
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal) {
          this._openPicker()
        }else{
          this._closePicker()
        }
      }
    },
    titleText: {//标题文案
      type: String,
      value: ""
    },
    cancelText:{//取消按钮文案
      type: String,
      value: "取消"
    },
    sureText:{//确定按钮文案
      type: String,
      value: "确定"
    },
    pickerHeaderStyle: String,//标题栏样式 view
    sureStyle: String, //标题栏确定样式  text
    cancelStyle: String,//标题栏取消样式 text
    titleStyle: String,//标题栏标题样式  view
    maskStyle: String,//设置蒙层的样式（详见picker-view） view
    indicatorStyle: String,//设置选择器中间选中框的样式（详见picker-view） view
    chooseItemTextStyle: String//设置picker列表文案样式 text
  },

  /**
   * 组件的初始数据
   */
  data: {
    currPickerTypeLength:3,//当前选择器的类型，
    currIndex:0,//当前滚动的列的下标，0是在滚动年,1是在滚动月,2是在滚动日
    columnsData: defaultColumnsData.concat(),//显示的picker 的数组
    value:[],//数组中的数字依次表示 picker-view 内的 picker-view-column 选择的第几项（下标从 0 开始）
    backData:'',//点击 确定 按钮 时返回的当前被选中的数组
    isOpen: false,//picker 是否打开
    scrollEnd : true,//滚动是否结束
    lastValue : [0, 0, 0,0,0,0],//上一次 滚动的 value
    isFirstOpen : true,//是否是第一次打开
    tempValue : [0, 0, 0,0,0,0],// 现在 正在 滚动的 value 
    defaultDateTemp:'', //默认值
    startDateTemp: '',//开始时间
    endDateTemp:'',//结束时间
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //点击蒙层
    tapModal () {
      this.properties.isShowPicker = false;
      this._closePicker()
    },
    //点击取消 按钮 
    cancle () {
      this.properties.isShowPicker = false
      this._closePicker()
      this.triggerEvent('cancle')
    },
    // 点击确定按钮
    sure () {
      let { scrollEnd, tempValue, currPickerTypeLength} = this.data;
      if(!scrollEnd) return;
      let arrBack2 = this._formateDateStrToArr(this._getBackDataFromValue(tempValue));
      let backData = arrBack2[0] + '-' + (parseInt(arrBack2[1]) < 10 ? '0' + arrBack2[1] : arrBack2[1]) + '-'+(parseInt(arrBack2[2]) < 10 ? '0' + arrBack2[2] : arrBack2[2])
      if (currPickerTypeLength == 4) {
        backData = backData + ' '+ (parseInt(arrBack2[3]) < 10 ? '0' + arrBack2[3] : arrBack2[3])
      } else if (currPickerTypeLength == 5) {
        backData = backData + ' '+ (parseInt(arrBack2[3]) < 10 ? '0' + arrBack2[3] : arrBack2[3]) + ':'+ (parseInt(arrBack2[4]) < 10 ? '0' + arrBack2[4] : arrBack2[4])
      }else if (currPickerTypeLength == 6) {
        backData = backData + ' '+ (parseInt(arrBack2[3]) < 10 ? '0' + arrBack2[3] : arrBack2[3])+ ':'+ (parseInt(arrBack2[4]) < 10 ? '0' + arrBack2[4] : arrBack2[4])+ ':'+ (parseInt(arrBack2[5]) < 10 ? '0' + arrBack2[5] : arrBack2[5])
      }
      this.setData({
        backData
      })
      this.triggerEvent('sure', backData);
      this._closePicker()
    },
    //滚动选择时触发change事件
    _bindChange (e) {// 触摸结束 就不执行
      let { columnsData,lastValue,scrollEnd } = this.data;
      if(scrollEnd) return;
      let val = e.detail.value;
      let { startDate, endDate } = this.properties;
      let columnsDataOld = JSON.parse(JSON.stringify(columnsData));
      let compareIndex = this._getScrollCompareIndex(lastValue, val);

      let tempStartArr = (startDate)?(this._formateDateStrToArr(startDate)):'' ;
      let tempEndArr =  (endDate)?(this._formateDateStrToArr(endDate)):'' ;
      if (compareIndex === 0 && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempStartArr[0])) {//如果在滚动年滚动到了startYear并且有起止，
        columnsData[1] = createStartMonthColumnsData({startMonth:tempStartArr[1]});
        // this.setData({
        //   'columnsData[1]': createStartMonthColumnsData({startMonth:tempStartArr[1]})
        // })
      } else if (compareIndex === 0 && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempEndArr[0]) ) {//如果在滚动年滚动到了endYear并且有起止，
       columnsData[1] = createEndMonthColumnsData({endMonth:tempEndArr[1]});
        // this.setData({
        //   'columnsData[1]': createEndMonthColumnsData({endMonth:tempEndArr[1]})
        // })
      }else if (compareIndex === 0 && startDate ) {//如果在滚动年并且有起止
       columnsData[1] = defaultColumnsData[1];
        // this.setData({
        //   'columnsData[1]': defaultColumnsData[1]
        // })
      }
      if( ( ( compareIndex === 0  ||  compareIndex === 1  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempStartArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempStartArr[1])) ){//如果在滚动【年/月】滚动到了startYear、startMonth，并且有起止
        columnsData[2] =  createStartDayColumnsData({startYear:tempStartArr[0],startMonth:tempStartArr[1], startDay:tempStartArr[2]});
        // this.setData({
        //   'columnsData[2]': createStartDayColumnsData({startYear:tempStartArr[0],startMonth:tempStartArr[1], startDay:tempStartArr[2]})
        // })
      }else if(( compareIndex === 0  ||  compareIndex === 1  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempEndArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempEndArr[1])  ){//如果在滚动【年/月】滚动到了endYear、endMonth，并且有起止
        columnsData[2] = createEndDayColumnsData({endDay:tempEndArr[2]});
        // this.setData({
        //   'columnsData[2]': createEndDayColumnsData({endDay:tempEndArr[2]})
        // })
      }else if( (compareIndex === 0 && startDate ) || ( compareIndex === 1  )){//如果在滚动【年/月】
        if (this.findAllDayByMonth( parseInt(columnsData[1][val[1]]) , parseInt(columnsData[0][val[0]]) ) && this.findAllDayByMonth( parseInt(columnsData[1][val[1]]) , parseInt(columnsData[0][val[0]]) ) != null) {
          columnsData[2] =  this.findAllDayByMonth( parseInt(columnsData[1][val[1]]) , parseInt(columnsData[0][val[0]]) );
          // this.setData({// 获取startDay 1天 到 dayLength 30 天  个 天数  的  天数  数组
          //   'columnsData[2]': this.findAllDayByMonth( parseInt(columnsData[1][val[1]]) , parseInt(columnsData[0][val[0]]) )
          // })
        }
      }
      if(  ( compareIndex === 0  ||  compareIndex === 1 ||  compareIndex === 2  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempStartArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempStartArr[1]) && parseInt(columnsData[2][val[2]]) == parseInt(tempStartArr[2]) ){//如果在滚动【年/月/日】滚动到了startYear、startMonth、startDay，并且有起止
        columnsData[3] =  createStartHourColumnsData({startHour:tempStartArr[3]});
        // this.setData({
        //   'columnsData[3]': createStartHourColumnsData({startHour:tempStartArr[3]})
        // })
      }else if(( compareIndex === 0  ||  compareIndex === 1 ||  compareIndex === 2  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempEndArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempEndArr[1]) && parseInt(columnsData[2][val[2]]) == parseInt(tempEndArr[2])  ){//如果在滚动【年/月/日】滚动到了endYear、endMonth、endDay，并且有起止
        columnsData[3] = createEndHourColumnsData({endHour:tempEndArr[3]});
        // this.setData({
        //   'columnsData[3]': createEndHourColumnsData({endHour:tempEndArr[3]})
        // })
      }else if( (compareIndex === 0 && startDate ) || ( compareIndex === 1 ) || ( compareIndex === 2 )  ){//如果在滚动【年/月/日】
        columnsData[3] = defaultColumnsData[3];
        // this.setData({
        //   'columnsData[3]': defaultColumnsData[3]
        // })
      }
      if(  ( compareIndex === 0  ||  compareIndex === 1 ||  compareIndex === 2 ||  compareIndex === 3   ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempStartArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempStartArr[1]) && parseInt(columnsData[2][val[2]]) == parseInt(tempStartArr[2]) && parseInt(columnsData[3][val[3]]) == parseInt(tempStartArr[3])  ){//如果在滚动【年/月/日/时】滚动到了startYear、startMonth、startDay、startHour，并且有起止
        columnsData[4] = createStartMinuteColumnsData({startMinute:tempStartArr[4]});
        // this.setData({
        //   'columnsData[4]': createStartMinuteColumnsData({startMinute:tempStartArr[4]})
        // })
      }else if(( compareIndex === 0  ||  compareIndex === 1 ||  compareIndex === 2 ||  compareIndex === 3  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempEndArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempEndArr[1]) && parseInt(columnsData[2][val[2]]) == parseInt(tempEndArr[2]) && parseInt(columnsData[3][val[3]]) == parseInt(tempEndArr[3])   ){//如果在滚动【年/月/日/时】滚动到了endYear、endMonth、endDay、endHour，并且有起止
        columnsData[4] = createEndMinuteColumnsData({endMinute:tempEndArr[4]});
        // this.setData({
        //   'columnsData[4]': createEndMinuteColumnsData({endMinute:tempEndArr[4]})
        // })
      }else if( (compareIndex === 0 && startDate ) || ( compareIndex === 1 ) || ( compareIndex === 2 ) || ( compareIndex === 3 )  ){//如果在滚动【年/月/日/时】
        columnsData[4] = defaultColumnsData[4];
        // this.setData({
        //   'columnsData[4]': defaultColumnsData[4]
        // })
      }
      if(  ( compareIndex === 0  ||  compareIndex === 1 ||  compareIndex === 2 ||  compareIndex === 3 ||  compareIndex === 4  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempStartArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempStartArr[1]) && parseInt(columnsData[2][val[2]]) == parseInt(tempStartArr[2]) && parseInt(columnsData[3][val[3]]) == parseInt(tempStartArr[3]) && parseInt(columnsData[4][val[4]]) == parseInt(tempStartArr[4])  ){//如果在滚动【年/月/日/时/分】滚动到了startYear、startMonth、startDay、startHour、startSecond，并且有起止
        columnsData[5] = createStartSecondColumnsData({startSecond:tempStartArr[5]});
        // this.setData({
        //   'columnsData[5]': createStartSecondColumnsData({startSecond:tempStartArr[5]})
        // })
      }else if(( compareIndex === 0  ||  compareIndex === 1 ||  compareIndex === 2 ||  compareIndex === 3 ||  compareIndex === 4  ) && startDate && parseInt(columnsData[0][val[0]]) == parseInt(tempEndArr[0]) && parseInt(columnsData[1][val[1]]) == parseInt(tempEndArr[1]) && parseInt(columnsData[2][val[2]]) == parseInt(tempEndArr[2]) && parseInt(columnsData[3][val[3]]) == parseInt(tempEndArr[3]) && parseInt(columnsData[4][val[4]]) == parseInt(tempEndArr[4])    ){//如果在滚动【年/月/日/时/分】滚动到了endYear、endMonth、endDay、endHour、endSecond，并且有起止
        columnsData[5] = createEndSecondColumnsData({endSecond:tempEndArr[5]});
        // this.setData({
        //   'columnsData[5]': createEndSecondColumnsData({endSecond:tempEndArr[5]})
        // })
      }else if( (compareIndex === 0 && startDate ) || ( compareIndex === 1 ) || ( compareIndex === 2 ) || ( compareIndex === 3 ) || ( compareIndex === 4 )  ){//如果在滚动【年/月/日/时/分】
        columnsData[5] = defaultColumnsData[5];
        // this.setData({
        //   'columnsData[5]': defaultColumnsData[5]
        // })
      }
      
      // if (  JSON.stringify(columnsData[1])  ==  JSON.stringify(columnsDataOld[1]) ) {
      // }else {
      //   this.setData({
      //     'columnsData[1]': columnsData[1]
      //   })
      // }
      // if (  JSON.stringify(columnsData[2])  ==  JSON.stringify(columnsDataOld[2]) ) {
      // }else {
      //   this.setData({
      //     'columnsData[2]': columnsData[2]
      //   })
      // }
      // if (  JSON.stringify(columnsData[3])  ==  JSON.stringify(columnsDataOld[3]) ) {
      // }else {
      //   this.setData({
      //     'columnsData[3]': columnsData[3]
      //   })
      // }
      // if (  JSON.stringify(columnsData[4])  ==  JSON.stringify(columnsDataOld[4]) ) {
      // }else {
      //   this.setData({
      //     'columnsData[4]': columnsData[4]
      //   })
      // }
      // if (  JSON.stringify(columnsData[5])  ==  JSON.stringify(columnsDataOld[5]) ) {
      // }else {
      //   this.setData({
      //     'columnsData[5]': columnsData[5]
      //   })
      // }
      this.setData({
        'columnsData': columnsData
      })
      //验证
      val = this._validate(val);
      this.data.lastValue = val;
      this.data.tempValue = val;
      this.data.currIndex = compareIndex
    },
    //对 value 进行 处理，
    _validate (val) {
      let { columnsData } = this.data;
      columnsData.forEach((v, i) => {
       // 如果 val下标数组 的 返回超出了 columnsData数组的范围，则 下标为相应的最后一个下标
        if(columnsData[i].length - 1 < val[i]){
          val[i] = columnsData[i].length - 1;
        }
      })
      this.setData({
        value: val
      })
      return val;
    },
     //触摸结束
    _bindpickend(){
      this.data.scrollEnd = true;
    },
    //触摸开始
    _bindpickstart(){
      this.data.scrollEnd = false;
    },
    //打开picker
    _openPicker () {
      if(!this.data.isFirstOpen){
        this._setDefault(this.data.backData)
      }
      this.data.isFirstOpen = false;
      this.setData({
        isOpen: true,
      })

    },
     //关闭picker
    _closePicker () {
      this.setData({
        isOpen: false
      })
    },

    //参数 '2018-1-1 00:00:01'或'2018-01-01 00:00:01'
    //返回 '[48, 0, 0,0,0,1]'，获取 defaultStr 在 columnsData中的下标数组
    _getValueFromDefaultDate (defaultStr) {
      let { columnsData } = this.data;
      let tempArr = this._formateDateStrToArr(defaultStr)
      return tempArr.map((v, i, arr) => columnsData[i].findIndex((u, j) => parseInt(u) == v))
    },
    //参数 [1, 2, 3,5,20,02]
    //返回 '1971-3-4 5:20:2'
    _getBackDataFromValue (val) {
      //reduce 接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值 
      // t 初始值, 或者计算结束后的返回值
      // v 当前元素item
     // i 当前元素index
      let tempStr = this.data.columnsData.reduce((t, v, i) => {
        return t + v[val[i]]
      }, '')
      return this._filterChinese(tempStr)
    },
    //过滤中文并添加'-'
    _filterChinese (includesChineseStr) {
      let result = '';
      if (includesChineseStr) {
        let str = includesChineseStr.replace(/[\u4e00-\u9fa5]/g,'-').replace(/\-$/,'');
        let arr = str.split('-')
        result = arr[0]+'-'+ arr[1]+'-'+arr[2]+' '+arr[3]+':'+arr[4]+':'+arr[5]
      }
      return result;
      // return arr;
    },
    //参数 start: '2017-01-11 00:00:00'  end: '2018-10-12 00:00:00'
    //返回 从 start 到 end之间 的   columnsData 数组
    _getColumnsDataFromStartAndEnd (start, end) {
      let tempStartArr = this._formateDateStrToArr(start);
      let tempEndArr = this._formateDateStrToArr(end);
      return createStartColumnsData({
        yearLength: tempEndArr[0] - tempStartArr[0],
        startYear: tempStartArr[0],
        startMonth: tempStartArr[1],
        startDay: tempStartArr[2],
        startHour: tempStartArr[3], 
        startMinute: tempStartArr[4], 
        startSecond: tempStartArr[5]
      })
    },
    /** 格式化日期字符串为数组/，参数 '2018-01-11 01:20:50'，返回 [2018, 1, 11,1,20,50] */
    _formateDateStrToArr (dateStr) {
      let dateStrArr = [0];
      if (dateStr) {
        // if (this.data.currPickerTypeLength == 3) {
        //   dateStr = dateStr + ' 00:00:00'
        // } else if (this.data.currPickerTypeLength == 4) {
        //   dateStr = dateStr + ':00:00'
        // } else if (this.data.currPickerTypeLength == 5) {
        //   dateStr = dateStr + ':00'
        // }
        dateStr = dateStr.replace(/(^\s*)|(\s*$)/g, "");
        if (dateStr.indexOf(':') < 0){
          if (dateStr.indexOf(' ') < 0){
            dateStr = dateStr + ' 00:00:00'
          } else {
            dateStr = dateStr + ':00:00'
          }
        } else if (dateStr.match(/:/g).length  == 1){
          dateStr = dateStr + ':00'
        }
        // if (dateStr.indexOf(':') < 0) {
        //   dateStr = dateStr + ' 00:00:00'
        // }
        
        // 将前面的 0去掉
        dateStrArr = ([].concat( dateStr.split(' ')[0].split('-')).concat( dateStr.split(' ')[1].split(':'))).map((v) => +v.replace(/^0/, ''));
      }
      // return dateStr.split('-').map((v) => +v.replace(/^0/, ''))
      return dateStrArr
    },
    //得到 当前是在滚动 哪个列 的下标，arr1 是 上一次滚动的位置 下标数组，arr2是当前滚动的下标数组，哪个不相等则 是滚动了哪一个
    _getScrollCompareIndex (arr1, arr2)  {
      let tempIndex = -1;
      for(let i = 0, len = arr1.length; i<len; i++){
        if(arr1[i] !== arr2[i]){
          tempIndex = i;
          break;
        }
      }
      return tempIndex;
    },
    /** 获取整个天数数组 */
    findAllDayByMonth:function (month,year) {
      if(parseInt(month)  === 2){
        if(isLeapYear( parseInt(year) )){
          return createEndDayColumnsData({endDay: 29});
        }else{
          return createEndDayColumnsData({endDay: 28});
        }
      }else if(bigMonth.find((v) => parseInt(v) == parseInt(month))){
        return defaultColumnsData[2].concat('31日');
      }else if(smallMonth.find((v) => parseInt(v) == parseInt(month))){
        this.setData({
          'columnsData[2]': defaultColumnsData[2]
        })
        return defaultColumnsData[2];
      }
      return null;
    },
    //对 默认值、开始和结束 日期进行处理
    _setDefault (inBackData) {
      let {startDate, endDate ,defaultDate} = this.properties;
      startDate = startDate === '' ? minDateStr : startDate;
      endDate = endDate === '' ? maxDateStr : endDate;
      this.setData({
        columnsData: this._getColumnsDataFromStartAndEnd(startDate, endDate)
      })
      if(inBackData){
        defaultDate = inBackData;
      }
      let tempArr = this._formateDateStrToArr(defaultDate)//没得默认时间的时候tempArr == [0]
      if(startDate && endDate && tempArr.length === 1){//没得默认时间的时候tempArr == [0]
        let tempStartArr = this._formateDateStrToArr(startDate);
        let tempEndArr = this._formateDateStrToArr(endDate);
        if(tempEndArr[0] === tempStartArr[0]){//起止同年
          this.setData({
            'columnsData[1]': createStartToEndMonthColumnsData({startMonth:tempStartArr[1],endMonth:tempEndArr[1]})
          })
        }else {
          this.setData({
            'columnsData[1]': createStartMonthColumnsData({startMonth:tempStartArr[1]})
          })
        }
        if(tempEndArr[0] === tempStartArr[0] && tempEndArr[1] === tempStartArr[1]){//起止同年同月
          this.setData({
            'columnsData[2]': createStartToEndDayColumnsData({startDay:tempStartArr[2], endDay:tempEndArr[2]})
          })
        }else {
          this.setData({
            'columnsData[2]': createStartDayColumnsData({startYear:tempStartArr[0],startMonth:tempStartArr[1], startDay:tempStartArr[2]})
          })
        }
        if(tempEndArr[0] === tempStartArr[0] && tempEndArr[1] === tempStartArr[1] && tempEndArr[2] === tempStartArr[2]){//起止同年同月同天
          this.setData({
            'columnsData[3]': createStartToEndHourColumnsData({startHour:tempStartArr[3],endHour:tempEndArr[3]})
          })
        }else {
          this.setData({
            'columnsData[3]':  createStartHourColumnsData({startHour:tempStartArr[3]})
          })
        }
        if(tempEndArr[0] === tempStartArr[0] && tempEndArr[1] === tempStartArr[1] && tempEndArr[2] === tempStartArr[2]  && tempEndArr[3] === tempStartArr[3]){//起止同年同月同天同小时
          this.setData({
            'columnsData[4]':  createStartToEndMinuteColumnsData({startMinute:tempStartArr[4],endMinute:tempEndArr[4]})
          })
        }else {
          this.setData({
            'columnsData[4]':  createStartMinuteColumnsData({startMinute:tempStartArr[4]})
          })
        }
        if(tempEndArr[0] === tempStartArr[0] && tempEndArr[1] === tempStartArr[1] && tempEndArr[2] === tempStartArr[2]  && tempEndArr[3] === tempStartArr[3] && tempEndArr[4] === tempStartArr[4]){//起止同年同月同天同小时同分钟
          this.setData({
            'columnsData[5]': createStartToEndSecondColumnsData({startSecond:tempStartArr[5],endSecond:tempEndArr[5]})
          })
        }else {
          this.setData({
            'columnsData[5]':  createStartSecondColumnsData({startSecond:tempStartArr[5]})
          })
        }



      }
      if(startDate && endDate && tempArr.length === 6){//如果有起止有默认默认时间
        let tempStartArr = this._formateDateStrToArr(startDate);
        let tempEndArr = this._formateDateStrToArr(endDate);
        if(tempArr[0] === tempStartArr[0]){//默认如果跟start同年
          this.setData({
            'columnsData[1]': createStartMonthColumnsData({startMonth:tempStartArr[1]}),
          })
          if(tempArr[1] === tempStartArr[1]){//默认同年并且跟start同月
            this.setData({// 获取startDay  以及之后的 天数 数组
              'columnsData[2]': createStartDayColumnsData({startYear:tempStartArr[0],startMonth:tempStartArr[1], startDay:tempStartArr[2]})
            })
          }else{//同年并且跟start不同月
            if (this.findAllDayByMonth(tempArr[1],tempArr[0] ) && this.findAllDayByMonth(tempArr[1],tempArr[0] ) != null) {
              this.setData({// 获取startDay 1天 到 dayLength 30 天  个 天数  的  天数  数组
                'columnsData[2]':this.findAllDayByMonth(tempArr[1],tempArr[0] )
              })
            }
          }
          if(tempArr[1] === tempStartArr[1] && tempArr[2] === tempStartArr[2]){//默认跟start同年同月同天
            this.setData({
              'columnsData[3]': createStartHourColumnsData({startHour:tempStartArr[3]})
            })
          }else {
            this.setData({
              'columnsData[3]':  defaultColumnsData[3]
            })
          }
          if(tempArr[1] === tempStartArr[1] && tempArr[2] === tempStartArr[2]  && tempArr[3] === tempStartArr[3]){//默认跟start同年同月同天同小时
            this.setData({
              'columnsData[4]':  createStartMinuteColumnsData({startMinute:tempStartArr[4]})
            })
          }else {
            this.setData({
              'columnsData[4]':  defaultColumnsData[4]
            })
          }
          if(tempArr[1] === tempStartArr[1] && tempArr[2] === tempStartArr[2]  && tempArr[3] === tempStartArr[3] && tempArr[4] === tempStartArr[4]){//默认跟start同年同月同天同小时同分钟
            this.setData({
              'columnsData[5]': createStartSecondColumnsData({startSecond:tempStartArr[5]})
            })
          }else {
            this.setData({
              'columnsData[5]':  defaultColumnsData[5]
            })
          }

        }
        if(tempArr[0] === tempEndArr[0]){//默认如果跟end同年
          this.setData({
            'columnsData[1]': createEndMonthColumnsData({endMonth:tempEndArr[1]}),
          })
          if(tempArr[1] === tempEndArr[1]){//同年并且跟end同月
            this.setData({
              'columnsData[2]': createEndDayColumnsData({endDay:tempEndArr[2]})
            })
          }else{//同年并且跟end不同月
            if (this.findAllDayByMonth(tempArr[1],tempArr[0] ) && this.findAllDayByMonth(tempArr[1],tempArr[0] ) != null) {
              this.setData({
                'columnsData[2]':this.findAllDayByMonth(tempArr[1],tempArr[0] )
              })
            }
          }
          if(tempArr[1] === tempEndArr[1] && tempArr[2] === tempEndArr[2]){//默认跟end同年同月同天
            this.setData({
              'columnsData[3]': createEndHourColumnsData({endHour:tempEndArr[3]})
            })
          }else {
            this.setData({
              'columnsData[3]':  defaultColumnsData[3]
            })
          }
          if(tempArr[1] === tempEndArr[1] && tempArr[2] === tempEndArr[2]  && tempArr[3] === tempEndArr[3]){//默认跟end同年同月同天同小时
            this.setData({
              'columnsData[4]':  createEndMinuteColumnsData({endMinute:tempEndArr[4]})
            })
          }else {
            this.setData({
              'columnsData[4]':  defaultColumnsData[4]
            })
          }
          if(tempArr[1] === tempEndArr[1] && tempArr[2] === tempEndArr[2]  && tempArr[3] === tempEndArr[3] && tempArr[4] === tempEndArr[4]){//默认跟end同年同月同天同小时同分钟
            this.setData({
              'columnsData[5]': createEndSecondColumnsData({endSecond:tempEndArr[5]})
            })
          }else {
            this.setData({
              'columnsData[5]':  defaultColumnsData[5]
            })
          }
        }
        if(tempArr[0] === tempStartArr[0] && tempArr[0] === tempEndArr[0]){//默认如果跟start和end都同年
          this.setData({
            'columnsData[1]': createStartToEndMonthColumnsData({startMonth:tempStartArr[1],endMonth:tempEndArr[1]}),
          })
          if(tempArr[1] === tempEndArr[1]){//默认跟end同年同月
            this.setData({
              'columnsData[2]': createEndDayColumnsData({endDay:tempEndArr[2]})
            })
          }else if(tempArr[1] === tempStartArr[1]){//默认跟start同年同月
            this.setData({
              'columnsData[2]': createStartDayColumnsData({startYear:tempStartArr[0],startMonth:tempStartArr[1], startDay:tempStartArr[2]})
            })
          } else{
            if (this.findAllDayByMonth(tempArr[1],tempArr[0] ) && this.findAllDayByMonth(tempArr[1],tempArr[0] ) != null) {
              this.setData({
                'columnsData[2]':this.findAllDayByMonth(tempArr[1],tempArr[0] )
              })
            }
          }
          if(tempArr[1] === tempEndArr[1] && tempArr[2] === tempEndArr[2]){//默认跟end同年同月同天
            this.setData({
              'columnsData[3]': createEndHourColumnsData({endHour:tempEndArr[3]})
            })
          } else if(tempArr[1] === tempStartArr[1] && tempArr[2] === tempStartArr[2]){//默认跟start同年同月同天
            this.setData({
              'columnsData[3]': createStartHourColumnsData({startHour:tempStartArr[3]})
            })
          }else {
            this.setData({
              'columnsData[3]':  defaultColumnsData[3]
            })
          }
          if(tempArr[1] === tempEndArr[1] && tempArr[2] === tempEndArr[2]  && tempArr[3] === tempEndArr[3]){//默认跟end同年同月同天同小时
            this.setData({
              'columnsData[4]':  createEndMinuteColumnsData({endMinute:tempEndArr[4]})
            })
          } else if(tempArr[1] === tempStartArr[1] && tempArr[2] === tempStartArr[2]  && tempArr[3] === tempStartArr[3]){//默认跟start同年同月同天同小时
            this.setData({
              'columnsData[4]':  createStartMinuteColumnsData({startMinute:tempStartArr[4]})
            })
          }else {
            this.setData({
              'columnsData[4]':  defaultColumnsData[4]
            })
          }
          if(tempArr[1] === tempEndArr[1] && tempArr[2] === tempEndArr[2]  && tempArr[3] === tempEndArr[3] && tempArr[4] === tempEndArr[4]){//默认跟end同年同月同天同小时同分钟
            this.setData({
              'columnsData[5]': createEndSecondColumnsData({endSecond:tempEndArr[5]})
            })
          } else  if(tempArr[1] === tempStartArr[1] && tempArr[2] === tempStartArr[2]  && tempArr[3] === tempStartArr[3] && tempArr[4] === tempStartArr[4]){//默认跟start同年同月同天同小时同分钟
            this.setData({
              'columnsData[5]': createStartSecondColumnsData({startSecond:tempStartArr[5]})
            })
          }else {
            this.setData({
              'columnsData[5]':  defaultColumnsData[5]
            })
          }


        }

        if(tempArr[0] !== tempEndArr[0] && tempArr[0]!== tempStartArr[0]){
          this.setData({
            'columnsData[1]': defaultColumnsData[1],
            'columnsData[3]': defaultColumnsData[3],
            'columnsData[4]': defaultColumnsData[4],
            'columnsData[5]': defaultColumnsData[5]
          })
          if (this.findAllDayByMonth(tempArr[1],tempArr[0] ) && this.findAllDayByMonth(tempArr[1],tempArr[0] ) != null) {
            this.setData({// 获取startDay 1天 到 dayLength 30 天  个 天数  的  天数  数组
              'columnsData[2]': this.findAllDayByMonth(tempArr[1],tempArr[0] )
            })
          }
        }
      }else if(!startDate && !endDate){
        this.setData({
          'columnsData[1]': defaultColumnsData[1],
          'columnsData[3]': defaultColumnsData[3],
          'columnsData[4]': defaultColumnsData[4],
          'columnsData[5]': defaultColumnsData[5]
        })
        if (this.findAllDayByMonth(tempArr[1],tempArr[0] ) && this.findAllDayByMonth(tempArr[1],tempArr[0] ) != null) {
          this.setData({// 获取startDay 1天 到 dayLength 30 天  个 天数  的  天数  数组
            'columnsData[2]':this.findAllDayByMonth(tempArr[1],tempArr[0] )
          })
        }
      }




      let value = defaultDate === '' ? [0,0,0,0,0,0] : this._getValueFromDefaultDate(defaultDate);
      let backData = this._getBackDataFromValue(value);
      this.data.tempValue = value;
      this.data.lastValue = value;
      this.data.value = value
      this.setData({
        value,
        backData
      })
    },
    /** 默认值、开始年月日、结束年月日 与其 临时保存的值 是否相等  */
    _compareDate () { //完全相等返回true
      let {defaultDateTemp, startDateTemp, endDateTemp} = this.data;
      let {defaultDate, startDate, endDate}  = this.properties;
      return defaultDateTemp === defaultDate && startDateTemp === startDate && endDateTemp === endDate
    },
    // 对 当前 的 字段 进行赋值
    _setTempData () {
      let {defaultDate, startDate, endDate, pickerType}  = this.properties;
      this.data.defaultDateTemp = defaultDate;
      this.data.startDateTemp = startDate;
      this.data.endDateTemp = endDate;
      this.data.currPickerTypeLength = 3;
      if (pickerType && pickerType == 'hour') {
        this.data.currPickerTypeLength = 4;
      } else if (pickerType && pickerType == 'minute') {
        this.data.currPickerTypeLength = 5;
      }else  if (pickerType && pickerType == 'second') {
        this.data.currPickerTypeLength = 6;
      }
      this.setData({
        currPickerTypeLength: this.data.currPickerTypeLength
      });
      // this.data.currPickerType = pickerType;
    }
  }
})

// // 年份        
// columnsData[0]
// // 月份         
// columnsData[1] 
//         //没有默认时间，起止同年 || 有默认时间并且默认时间跟start和end都同年。获取 startMonth开始月份 到  endMonth结束月份 的 月份数组
//         createStartToEndMonthColumnsData({startMonth:tempStartArr[1],endMonth:tempEndArr[1]})
//         //没有默认时间，起止 不同年 || 有默认时间，默认时间和开始时间start同年。获取startMonth 以及之后的 月 份数组
//         createStartMonthColumnsData({startMonth:tempStartArr[1]})
//         //有默认时间，默认时间和结束时间end同年 。获取 从  1月 到 endMonth月  个 月份  的 月份  数组
//         createEndMonthColumnsData({endMonth:tempEndArr[1]})
//         //有默认时间，默认时间 跟start和end都 不 同年 || 没有开始时间和结束时间。获取 从 startMonth 1月 到 monthLength 12 月  个 月份  的 月份  数组
//         defaultColumnsData[1]
// // 天数 
// columnsData[2]
//         //没有默认时间，起止 同年同月。获取startDay 开始天数 到  endDay 结束天数 的 天数数组
//         createStartToEndDayColumnsData({startDay:tempStartArr[2], endDay:tempEndArr[2]})
//         //没有默认时间，起止同年不同月 || 没有默认时间，起止不同年 || 有默认时间，默认时间和开始时间start同年同月 || 有默认时间并且默认时间跟start和end都同年，和start同月 。获取startDay  以及之后的 天数 数组
//         createStartDayColumnsData({startYear:tempStartArr[0],startMonth:tempStartArr[1], startDay:tempStartArr[2]})
//         //有默认时间，默认时间和结束时间end同年同月 || 有默认时间并且默认时间跟start和end都同年，和end同月。获取 从 1日到 endDay日 个 天数 的天数 数组
//         createEndDayColumnsData({endDay:tempEndArr[2]})
//         // 有默认时间，默认时间和开始时间start同年不同月 || 有默认时间，默认时间和结束时间end同年 不同月 || 有默认时间并且默认时间跟start和end都同年，和end和start都不同月 ||  有默认时间，默认时间 跟start和end都 不 同年 || 没有开始时间和结束时间
//             // 如果 tempArr[1] === 2 默认时间的月份是2月 并且是闰年。获取 从 1日到 endDay日 个 天数 的天数 数组
//             createEndDayColumnsData({endDay: 29})
//             // 如果 tempArr[1] === 2 默认时间的月份是2月 并且不是闰年。获取 从 1日到 endDay日 个 天数 的天数 数组
//             createEndDayColumnsData({endDay: 28})
//             // 如果 默认时间的月份是 1、3、5等大月。获取 从 获取startDay 1天 到 dayLength 30+1= 31 天  个  天数  的  天数  数组
//             defaultColumnsData[2].concat('31日')
//              // 如果 默认时间的月份是 4、6等小月。获取 从 获取startDay 1天 到 dayLength 30 天  个 天数  的  天数  数组
//              defaultColumnsData[2]
// // 小时
// columnsData[3]
//         //没有默认时间，起止 同年同月同天。获取 startHour开始小时 到 endHour 结束小时 的 小时数组
//         createStartToEndHourColumnsData({startHour:tempStartArr[3],endHour:tempEndArr[3]})
//         //没有默认时间，起止 同年同月不同天 || 没有默认时间，起止 同年不同月 || 没有默认时间，起止 不同年 
//         // || 有默认时间，默认时间和开始时间start同年同月同天，。
//         // 获取startHour 以及之后的 小时数组
//         createStartHourColumnsData({startHour:tempStartArr[3]})
//         //有默认时间，默认时间和结束时间end同年同月同天 || 有默认时间，默认时间和结束时间end 和开始时间start 同年同月，与end同天。获取 从  0小时 到 endHour小时  个 小时  的 小时  数组
//         createEndHourColumnsData({endHour:tempEndArr[3]})
//         // 有默认时间，默认时间和，开始时间start同年同月不同天 || 有默认时间，默认时间和，开始时间start同年不同月 || 有默认时间，默认时间和，开始时间start不同年
//         // 有默认时间，默认时间和，结束时间end同年同月不同天 || 有默认时间，默认时间和，结束时间end同年不同月 || 有默认时间，默认时间和结束时间end不同年
//         //。获取 从 startHour 0小时 到 hourLength 23 小时  个 小时  的 小时 数组
//         defaultColumnsData[3]

// // 分钟
// columnsData[4]
//         //。获取 startMinute 开始分钟 到  endMinute 结束分钟 的 分钟数组 
//         createStartToEndMinuteColumnsData({startMinute:tempStartArr[4],endMinute:tempEndArr[4]})
//         //。获取 startMinute 以及之后的 分钟 数组
//         createStartMinuteColumnsData({startMinute:tempStartArr[4]})
//         //。获取 从 0分钟 到 endMinute分钟  个 分钟  的 分钟  数组
//         createEndMinuteColumnsData({endMinute:tempEndArr[4]})
//         //。获取 从 startMinute 0分钟 到 minuteLength 59 分钟  个 分钟  的 分钟 数组
//         defaultColumnsData[4]
// // 秒
// columnsData[5]
//         //。获取 startSecond 开始秒 到  endSecond 结束秒 的 秒数组
//         createStartToEndSecondColumnsData({startSecond:tempStartArr[5],endSecond:tempEndArr[5]})
//         //。获取 startSecond 以及之后的 秒钟 数组
//         createStartSecondColumnsData({startSecond:tempStartArr[5]})
//         //。获取 从 0秒钟 到 endMonth秒钟  个 秒钟  的 秒钟 数组
//         createEndSecondColumnsData({endSecond:tempEndArr[5]})
//         //。获取 从 startSecond 0 秒钟 到 secondLength 59 秒钟  个 秒钟  的  秒钟 数组
//         defaultColumnsData[5]
