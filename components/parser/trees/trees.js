const errorImg = require('../libs/config.js').errorImg;
const core = require("../../../utils/core/core.js");
const document = require('../libs/document.js');

Component({
  options: {
    addGlobalClass: true //表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面
  },
  data: {
    canIUse: !!wx.chooseMessageFile,
    placeholder: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='225'/>",
    ctrl: [],
    windowWidth: core.globalData.windowWidth, // 手机宽度
    parserScrollTouchData:{},
  },
  properties: {
    nodes: Array,
    lazyLoad: Boolean,
    loading: String
  },
  methods: {
    parserScroll : function (event) {
      // that.top && that.top.triggerEvent('parserNotScrollTouch', {targetEleEvent: event});
    },
    parserScrollChapter: function (event) {
      return false;
      let that = this;
      let attrs = event.currentTarget.dataset.attrs;
      let width = +(event.currentTarget.dataset.widthrightall);
      let windowWidth = that.data.windowWidth;
      // console.log('event', event)
      if (event.type == 'touchstart') {

        this.data.parserScrollTouchData.startX = event.changedTouches[0].clientX;
        this.data.parserScrollTouchData.startY = event.changedTouches[0].clientY;
        this.setData({
          parserScrollTouchData: this.data.parserScrollTouchData
        });
        this.createSelectorQuery().select('#'+ attrs.id).boundingClientRect(function(scrollRes) {
          that.top && that.top.triggerEvent('parserScrollTouch', {targetEleInfo: scrollRes, targetEleEvent: event});
        }).exec();

      } else if (event.type == 'touchmove') {

        let moveX = event.changedTouches[0].clientX - this.data.parserScrollTouchData.startX;
        let moveY = event.changedTouches[0].clientY - this.data.parserScrollTouchData.startY;
        //返回角度 /Math.atan()返回数字的反正切值
        // let angle = 360 * Math.atan(moveY / moveX) / (2 * Math.PI);
        // if(Math.abs(angle) >30 ){//滑动超过30度
        //   return false;
        // }
        if (moveX < 10 && moveX > -10){
          return false;
        }else if(moveX < -10){//向左滑动，去 下一章
          this.createSelectorQuery().select('#'+ attrs.id).boundingClientRect(function(scrollRes) {
            // console.log('scrollRes触摸开始',scrollRes)
            // if ( scrollRes.left && width > windowWidth && Math.abs(scrollRes.left) > (width - windowWidth) && Math.abs(scrollRes.left) < width ) {
            //   console.log('event', event)

            //   console.log(' (width - windowWidth)',  (width - windowWidth))
            //   console.log('触摸了最后面')
              
            // }
            that.top && that.top.triggerEvent('parserScrollTouch', {targetEleInfo: scrollRes, targetEleEvent: event, windowWidth: windowWidth, width:width, screenWidth: core.globalData.screenWidth});
        }).exec();
        }else if(moveX > 10){//向右滑动，去 上一章
          this.createSelectorQuery().select('#'+ attrs.id).boundingClientRect(function(scrollRes) {
            // if ( scrollRes.left < windowWidth && scrollRes.left > 0 ) {
            //   console.log('event', event)
            //   console.log('scrollRes触摸开始12',scrollRes)

            //   console.log(' event.changedTouches[0].clientX',  event.changedTouches[0].clientX)
            //   console.log('  this.data.parserScrollTouchData.startX',  that.data.parserScrollTouchData.startX)
            //   console.log('触摸了最前面')
              
            // }
            that.top && that.top.triggerEvent('parserScrollTouch', {targetEleInfo: scrollRes, targetEleEvent: event, windowWidth: windowWidth, width:width, screenWidth: core.globalData.screenWidth});
          }).exec();
        }

      } else if (event.type == 'touchend') {

        this.createSelectorQuery().select('#'+ attrs.id).boundingClientRect(function(scrollRes) {
          that.top && that.top.triggerEvent('parserScrollTouch', {targetEleInfo: scrollRes, targetEleEvent: event});
        }).exec();

      }
    },
    // 自定义事件
    copyCode(e) {
      wx.showActionSheet({
        itemList: ['复制代码'],
        success: () =>
          wx.setClipboardData({
            data: e.target.dataset.content
          })
      })
    },
    // 视频自然结束事件
    ended (e) {
      this.top.triggerEvent('ended', {info :e})
    },
    // 视频播放事件
    play(e) {
      this.top.group && this.top.group.pause(this.top.i);
      if (this.top.videoContexts.length > 1 && this.top.data.autopause)
        for (var i = this.top.videoContexts.length; i--;)
          if (this.top.videoContexts[i].id != e.currentTarget.id)
            this.top.videoContexts[i].pause();
    },
    // 图片事件
    imgtap(e) {
      var attrs = e.currentTarget.dataset.attrs;
      if (!attrs.ignore) {
        var preview = true;
        this.top.triggerEvent('imgtap', {
          id: e.currentTarget.id,
          src: attrs.src,
          ignore: () => preview = false
        })
        if (preview) {
          if (this.top.group) return this.top.group.preview(this.top.i, attrs.i);
          var urls = this.top.imgList,
            current = urls[attrs.i] ? urls[attrs.i] : (urls = [attrs.src], attrs.src);
          wx.previewImage({
            current,
            urls
          })
        }
      }
    },
    loadImg(e) {
      var i = e.target.dataset.i;
      if (this.data.lazyLoad && !this.data.ctrl[i])
        this.setData({
          [`ctrl[${i}]`]: 1
        })
      else if (this.data.loading && this.data.ctrl[i] != 2)
        this.setData({
          [`ctrl[${i}]`]: 2
        })
    },
    // 链接点击事件
    linkpress(e) {
      var jump = true,
        attrs = e.currentTarget.dataset.attrs;
      attrs.ignore = () => jump = false;
      this.top.triggerEvent('linkpress', attrs);
      if (jump) {
        if (attrs['app-id'])
          wx.navigateToMiniProgram({
            appId: attrs['app-id'],
            path: attrs.path
          })
        else if (attrs.href) {
          if (attrs.href.includes('.doc') || attrs.href.includes('.docx') || attrs.href.includes('.xls') || attrs.href.includes('.xlsx') || attrs.href.includes('.ppt') || attrs.href.includes('.pptx') || attrs.href.includes('.pdf')){
            //去查看文件 
            core.service.downLoadAndLookFile(attrs.href);
          }else if (attrs.href[0] == '#')
            this.top.navigateTo({
              id: attrs.href.substring(1)
            })
          else if (attrs.href.indexOf('http') == 0 || attrs.href.indexOf('//') == 0)
            wx.setClipboardData({
              data: attrs.href,
              success: () =>
                wx.showToast({
                  title: '链接已复制'
                })
            })
          else
            wx.navigateTo({
              url: attrs.href,
              fail() {
                wx.switchTab({
                  url: attrs.href,
                })
              }
            })
        }
      }
    },
    // 错误事件
    error(e) {
      var source = e.target.dataset.source,
        i = e.target.dataset.i,
        node = this.data.nodes[i];
      if (source == 'video' || source == 'audio') {
        // 加载其他 source
        var index = (node.i || 0) + 1;
        if (index < node.attrs.source.length)
          return this.setData({
            [`nodes[${i}].i`]: index
          })
      } else if (source == 'img' && errorImg) {
        this.top.imgList.setItem(e.target.dataset.index, errorImg);
        this.setData({
          [`nodes[${i}].attrs.src`]: errorImg
        })
      } else if (source == 'ad') {
        this.setData({
          [`nodes[${i}].attrs.display`]: 'none'
        })
      }
      this.top && this.top.triggerEvent('error', {
        source,
        target: e.target,
        errMsg: e.detail.errMsg
      })
    },
    // 加载视频
    loadVideo(e) {
      this.setData({
        [`nodes[${e.target.dataset.i}].attrs.autoplay`]: true
      })
    }
  }
})