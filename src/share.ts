// import wx from 'weixin-js-sdk'
import { getGlobalConfig } from './init'
const wx = require('weixin-js-sdk')

// https://zhuanlan.zhihu.com/p/364767359
declare global {
  interface Window {
    sendMessage: any;
  }
}

export function share(shareInfo: any, appId: string, appType: number, isWechat: boolean = false) {

  // app 分享
  if (window.sendMessage) {
    window.sendMessage({
      command: 'pageInfo',
      href: shareInfo.url,
      title: shareInfo.title,
      desc: shareInfo.content,
      thumbnail: shareInfo.image,
    })
  }

  if (!isWechat) {
    return
  }

  const { location } = window

  let url = location.href
  if (location.hash) {
    url = url.replace(location.hash, '')
  }

  getGlobalConfig().jssdkSignture({
    appId,
    appType,
    url,
  })
  .then(response => {
    if(response.code === 0) {
      let data = response.data
      let jsApiList = [
        'onMenuShareAppMessage',
        'onMenuShareTimeline',
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareWeibo',
        'previewImage',
      ]
      wx.config({
        debug: false,
        appId: data.app_id,
        timestamp: data.timestamp,
        nonceStr: data.noncestr,
        signature: data.signature,
        jsApiList
      })

      wx.ready(() => {
        wx.checkJsApi({
          jsApiList,
          success: res => {
            let result = res.checkResult

            if (result.updateAppMessageShareData) {
              wx.updateAppMessageShareData({
                title: shareInfo.title,
                desc: shareInfo.content,
                link: shareInfo.url,
                imgUrl: shareInfo.image
              })
            }
            // 旧版,用来适配Android
            if (result.onMenuShareAppMessage) {
              wx.onMenuShareAppMessage({
                title: shareInfo.title,
                desc: shareInfo.content,
                link: shareInfo.url,
                imgUrl: shareInfo.image
              })
            }

            if (result.updateTimelineShareData) {
              wx.updateTimelineShareData({
                title: shareInfo.title,
                link: shareInfo.url,
                imgUrl: shareInfo.image,
              })
            }
            if (result.onMenuShareTimeline) {
              wx.onMenuShareTimeline({
                title: shareInfo.title,
                link: shareInfo.url,
                imgUrl: shareInfo.image,
              })
            }

            if (result.onMenuShareWeibo) {
              wx.onMenuShareWeibo({
                title: shareInfo.title,
                desc: shareInfo.content,
                link: shareInfo.url,
                imgUrl: shareInfo.image
              })
            }
          }
        })
      })
    }
  })

}
