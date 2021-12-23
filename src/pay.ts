// https://zhuanlan.zhihu.com/p/364767359
declare global {
  interface Window {
    WeixinJSBridge: any;
  }
}

export function pay(params: any): Promise<any> {
  return new Promise(
    function (resolve, reject) {
      if (window.WeixinJSBridge) {
        window.WeixinJSBridge.invoke(
          'getBrandWCPayRequest',
          params,
          function (res: any) {
            const { err_msg } = res
            if (err_msg == 'get_brand_wcpay_request:ok' ) {
              resolve(res)
            }
            else if (err_msg !== 'get_brand_wcpay_request:cancel') {
              reject(err_msg || '支付失败')
            }
          }
        )
      }
      else {
        reject('缺少微信环境支持')
      }
    }
  )
}
