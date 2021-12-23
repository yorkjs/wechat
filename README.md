# wechat

整合微信常用的授权、支付、分享方法。

## 安装

CDN

```html
<script src="https://unpkg.com/@yorkjs/wechat"></script>
<script>
  wechat.init({
    storage: Storage,
    getTimestamp: () => number,
    jssdkSignture: (appId, url) => Promise<any>,
  })
  // componentAppId 可选（第三方授权账号使用）
  wechat.requestAuth(state, url, appId, componentAppId)
</script>
```

NPM

```shell
npm install @yorkjs/wechat
```

YARN

```shell
yarn add @yorkjs/wechat
```

```js
import wechat from '@yorkjs/wechat'

// 初始化
wechat.init({
  storage: Storage,
  getTimestamp: () => number,
  getSignture: (appId: string, url: string) => Promise<any>,
})

// 发起微信授权 componentAppId 可选（第三方授权账号使用）
wechat.requestAuth(state, url, appId, componentAppId)

// 解析授权返回的 state 和 code
// checkRule 校验规则，可选
// {
//   expireSeconds: 10, // 过期秒数
//   once: true, // 是否只读一次
// }
wechat.getAuthQuery(url, checkRule)
```

## 参考微信授权文档

https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
