const globalData = require("globaldata.js");
function DialogUitl(){}

/* 显示消息框 */
DialogUitl.prototype.showToast = function(list) {
  let title1 = null
  if (list && list.title) {
    title1 = list.title
    let icon1 = 'none'
    if (list && list.icon) {
      icon1 = list.icon
    }
    let duration1 = globalData.operState.duration
    if (list && list.duration) {
      duration1 = list.duration
    }
    let mask1 = false;
    if (list && list.mask && list.mask=='true') {
      mask1 = true
    }
    wx.showToast({
      title: title1,
      icon: icon1,
      duration: duration1,
      mask:mask1
    })
    setTimeout(function () {
      wx.hideToast()
    }, duration1)
  }
  
}
/* 显示对话框 */
DialogUitl.prototype.showModal = function (list,confirmback,cancelback) {
  let title1 = '提示'
  if (list && list.title) {
    title1 = list.title
  }
  let content1 = ''
  if (list && list.content) {
    content1 = list.content
  }
  let showCancel1 = true
  if (list && list.showCancel) {
    if (list.showCancel == 'false'){
      showCancel1 = false
    }else{
      showCancel1 = true
    }
  }
  let cancelText1 = '取消'
  if (list && list.cancelText) {
    cancelText1 = list.cancelText
  }
  let confirmText1 = '确定'
  if (list && list.confirmText) {
    confirmText1 = list.confirmText
  } 

  wx.showModal({
    title: title1,
    content: content1,
    showCancel: showCancel1,
    confirmText: confirmText1,
    cancelText: cancelText1,
    confirmColor:"#0033cc",
    cancelColor:"#000000",
    success(res) {
      if (res.confirm) {
        confirmback()
      } else if (res.cancel) {
        cancelback()
      }
    }
  })
}

module.exports = new DialogUitl();