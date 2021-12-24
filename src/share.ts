import { ShareInfo, Signture } from './type'

export function share(wx: any, signature: Signture, shareInfo: ShareInfo, debug = false): Promise<void> {

  return new Promise(function(resolve, reject) {

    const jsApiList = [
      'onMenuShareAppMessage',
      'onMenuShareTimeline',
      'updateAppMessageShareData',
      'updateTimelineShareData',
      'onMenuShareWeibo',
      'previewImage',
    ]
    wx.config({
      debug,
      appId: signature.appId,
      timestamp: signature.timestamp,
      nonceStr: signature.nonceStr,
      signature: signature.signature,
      jsApiList
    })

    wx.ready(function () {
      wx.checkJsApi({
        jsApiList,
        success (res) {
          const result = res.checkResult

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

    resolve()
  })

}
