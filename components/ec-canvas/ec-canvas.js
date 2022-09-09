import WxCanvas from './wx-canvas';
import * as echarts from './echarts';
const core = require("../../utils/core/core.js")

let ctx;
// 对版本进行 比较，判断是否是新版本
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

Component({
  properties: {
    canvasId: {//canvas 图表的id，区别多个canvas，是唯一的
      type: String,
      value: 'ec-canvas'
    },

    ec: {//需绑定的 ec 变量
      type: Object
    },

    forceUseOldCanvas: {//开发者是否 强制使用旧canvas
      type: Boolean,
      value: false
    }
  },

  data: {
    isUseNewCanvas: false  //是否使用新版本的Canvas
  },

  ready: function () {
    if (!this.data.ec) {
      core.dialogUtil.showToast({ title: '组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" '
        + 'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>' });
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },

  methods: {
    //初始化canvas
    init: function (callback) {
      const version = wx.getSystemInfoSync().SDKVersion

      const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0;
      const forceUseOldCanvas = this.data.forceUseOldCanvas;
      const isUseNewCanvas = canUseNewCanvas && !forceUseOldCanvas;
      this.setData({ isUseNewCanvas });

      if (forceUseOldCanvas && canUseNewCanvas) {
        // core.dialogUtil.showToast({ title: '开发者强制使用旧canvas,建议关闭' });
      }

      if (isUseNewCanvas) {
        this.initByNewWay(callback);
      } else {
        const isValid = compareVersion(version, '1.9.91') >= 0
        if (!isValid) {
          core.dialogUtil.showToast({ title: '微信基础库版本过低，需大于等于 1.9.91。'
          + '参见：https://github.com/ecomfe/echarts-for-weixin'
          + '#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82' });
          return;
        } else {
          // core.dialogUtil.showToast({ title: '建议将微信基础库调整大于等于2.9.0版本。升级后绘图将有更好性能' });
          this.initByOldWay(callback);
        }
      }
    },
    //微信基础库 小于 等于 2.9.0版本 时的初始化
    initByOldWay(callback) {
      // 1.9.91 <= version < 2.9.0：原来的方式初始化
      ctx = wx.createCanvasContext(this.data.canvasId, this);
      const canvas = new WxCanvas(ctx, this.data.canvasId, false);

      echarts.setCanvasCreator(() => {
        return canvas;
      });
      // const canvasDpr = wx.getSystemInfoSync().pixelRatio // 微信旧的canvas不能传入dpr
      const canvasDpr = 1
      var query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas').boundingClientRect(res => {
        if (typeof callback === 'function') {
          this.chart = callback(canvas, res.width, res.height, canvasDpr);
        }
        else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
          this.chart = this.data.ec.onInit(canvas, res.width, res.height, canvasDpr);
        }
        else {
          this.triggerEvent('init', {
            canvas: canvas,
            width: res.width,
            height: res.height,
            canvasDpr: canvasDpr // 增加了dpr，可方便外面echarts.init
          });
        }
      }).exec();
    },
  //微信基础库 大于 2.9.0版本 时的初始化
    initByNewWay(callback) {
      // version >= 2.9.0：使用新的方式初始化
      const query = wx.createSelectorQuery().in(this)
      query
        .select('.ec-canvas')
        .fields({ node: true, size: true })
        .exec(res => {
          const canvasNode = res[0].node
          this.canvasNode = canvasNode

          const canvasDpr = wx.getSystemInfoSync().pixelRatio
          const canvasWidth = res[0].width
          const canvasHeight = res[0].height

          const ctx = canvasNode.getContext('2d')

          const canvas = new WxCanvas(ctx, this.data.canvasId, true, canvasNode)
          echarts.setCanvasCreator(() => {
            return canvas
          })

          if (typeof callback === 'function') {
            this.chart = callback(canvas, canvasWidth, canvasHeight, canvasDpr)
          } else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
            this.chart = this.data.ec.onInit(canvas, canvasWidth, canvasHeight, canvasDpr)
          } else {
            this.triggerEvent('init', {
              canvas: canvas,
              width: canvasWidth,
              height: canvasHeight,
              dpr: canvasDpr
            })
          }
        })
    },
    //把当前图表导出生成指定大小的图片
    canvasToTempFilePath(opt) {
      if (this.data.isUseNewCanvas) {
        // 新版
        const query = wx.createSelectorQuery().in(this)
        query
          .select('.ec-canvas')
          .fields({ node: true, size: true })
          .exec(res => {
            const canvasNode = res[0].node
            opt.canvas = canvasNode
            wx.canvasToTempFilePath(opt)
          })
      } else {
        // 旧的  
        if (!opt.canvasId) {
          opt.canvasId = this.data.canvasId;
        }
        ctx.draw(true, () => {
          wx.canvasToTempFilePath(opt, this);
        });
      }
    },
    //触摸开始
    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'start');
      }
    },
   //触摸中
    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'change');
      }
    },
   //触摸结束
    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        var handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'end');
      }
    }
  }
});
//获取 offsetX 和 offsetY
function wrapTouch(event) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
}
