/*
  audio 扩展包
  github：https://github.com/jin-yufeng/Parser
  docs：https://jin-yufeng.github.io/Parser
  author：JinYufeng
*/
const core = require("../../../utils/core/core.js")

Component({
  /**一些组件选项 */
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    addGlobalClass: true //表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面
  },
  data: {
    time: '00:00',
    durationRime:'00:00',
  },
  properties: {
    author: String,
    autoplay: Boolean,
    controls: Boolean,
    loop: Boolean,
    name: String,
    poster: String,
    src: {
      type: String,
      observer(src) {
        this.setSrc(src);
      }
    }
  },
  created() {
    this._ctx = wx.createInnerAudioContext();
    this._ctx.onError((err) => {
      this.setData({
        error: true
      })
      this.triggerEvent('error', err);
    })
    // this._ctx.onCanplay((err) => {
    // })
    
    this._ctx.onTimeUpdate(() => {
      var time = this._ctx.currentTime,
        min = parseInt(time / 60),
        sec = Math.ceil(time % 60),
        data = {};

        

      data.time = (min > 9 ? min : '0' + min) + ':' + (sec > 9 ? sec : '0' + sec);

      var timea = this._ctx.duration,
        mina = parseInt(timea / 60),
        seca = Math.ceil(timea % 60);
        data.durationRime = (mina > 9 ? mina : '0' + mina) + ':' + (seca > 9 ? seca : '0' + seca);

      if (!this.lastTime) data.value = time / this._ctx.duration * 100; // 不在拖动状态下
      this.setData(data);

    })
    this._ctx.onEnded(() => {
      this.setData({
        playing: false
      })
      this.triggerEvent('ended'); // 监听自然结束事件
    })
  },
  detached() {
    this._ctx.destroy();
  },
  pageLifetimes: {
    show() {
      if (this.data.playing && this._ctx.paused)
        this._ctx.play();
    }
  },
  methods: {
    /** 去下载 */
    toDownload(){
      core.service.downLoadAndLookFile(this.properties.src);
    },
    // 设置源
    setSrc(src) {
      this._ctx.autoplay = this.data.autoplay;
      this._ctx.loop = this.data.loop;
      this._ctx.src = src;
      if (this.data.autoplay && !this.data.playing)
        setTimeout(() => {
          this.setData({
            playing: true
          })
        }, 50)
    },
    // 播放
    play() {
      this._ctx.play();
      this.setData({
        playing: true
      })
      this.triggerEvent('play');
    },
    // 暂停
    pause() {
      this._ctx.pause();
      this.setData({
        playing: false
      })
      this.triggerEvent('pause');
    },
    // 移动进度条
    seek(sec) {
      this._ctx.seek(sec);
    },
    // 内部方法
    _seeking(e) {
      if (e.timeStamp - this.lastTime < 200) return;
      var time = Math.round(e.detail.value / 100 * this._ctx.duration),
        min = parseInt(time / 60),
        sec = time % 60;
      this.setData({
        time: (min > 9 ? min : '0' + min) + ':' + (sec > 9 ? sec : '0' + sec)
      })
      this.lastTime = e.timeStamp;
    },
    _seeked(e) {
      this.seek(e.detail.value / 100 * this._ctx.duration);
      this.lastTime = void 0;
    }
  }
})