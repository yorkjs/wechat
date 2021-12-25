import {
  ApiList,
  Signture,
  ShareInfo,
} from './type'

export function share(wx: any, signature: Signture, jsApiList: ApiList, shareInfo: ShareInfo, debug = false): Promise<void> {

  return new Promise(function(resolve, reject) {
    // config 信息验证后会执行 ready 方法，所有接口调用都必须在 config 接口获得结果之后，
    // config 是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
    // 则须把相关接口放在 ready 函数中调用来确保正确执行
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

          if (result.updateTimelineShareData) {
              wx.updateTimelineShareData({
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

          // 旧版,用来适配Android
          if (result.onMenuShareAppMessage) {
            // 即将废弃
            wx.onMenuShareAppMessage({
              title: shareInfo.title,
              desc: shareInfo.content,
              link: shareInfo.url,
              imgUrl: shareInfo.image
            })
          }

          if (result.onMenuShareTimeline) {
            // 即将废弃
            wx.onMenuShareTimeline({
              title: shareInfo.title,
              link: shareInfo.url,
              imgUrl: shareInfo.image,
            })
          }
        }
      })
    })

    wx.error(function(res){
      // config 信息验证失败会执行 error 函数，如签名过期导致验证失败，
      // 具体错误信息可以打开 config 的 debug 模式查看，
      // 也可以在返回的 res 参数中查看，对于 SPA 可以在这里更新签名
      reject(res)
    })

    resolve()
  })

}
