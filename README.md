# wechat

整合微信常用的授权、支付、分享方法。

## 安装

### CDN

```html
<script src="https://unpkg.com/@yorkjs/wechat"></script>
```

### NPM

```shell
npm install @yorkjs/wechat
```

### YARN

```shell
yarn add @yorkjs/wechat
```

### 微信授权

参考微信授权文档:
https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html

```js
import wechat from '@yorkjs/wechat'

// 初始化需要的对象
// storage 存储对象，包含 get/set/remove 方法
// getTimestamp 获取当前时间的方法（毫秒）
wechat.init({
  storage: {
    get(key) {
      return localStorage.getItem(key)
    },
    set(key, value) {
      localStorage.setItem(key, value)
    },
    remove(key) {
      localStorage.removeItem(key)
    }
  },
  getTimestamp() {
    return Date.now()
  },
})

// 发起微信授权 componentAppId 可选（第三方授权账号使用）
wechat.startAuth(state, url, appId, componentAppId)

// 解析授权返回的 state 和 code
// checkRule 校验规则，可选
// {
//   expireSeconds: 10, // 过期秒数
//   once: true, // 是否只读一次
// }
wechat.getAuthQuery(url, checkRule)

// 成功后，结束授权，清理内部相关信息
wechat.endAuth(state)
```

### 分享
```js
// wx: 微信网页内的 wx 对象
// signatrue: 签名
// jsApiList: js 接口列表
// shareInfo: 分享的内容
// debug: 是否开启调试
wechat
  .share((wx, signature, jsApiList, shareInfo, debug)
  .then(() => {})
  .catch(() => {})
```

### 支付

参考微信支付文档:
https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_7
```js
// params 参数，参考微信支付文档的 getBrandWCPayRequest 参数定义
wechat.pay(params)
  .then(() => {})
  .catch(() => {})
```
