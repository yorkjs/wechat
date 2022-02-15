import * as Url from '@yorkjs/url'

import {
  setStorage,
  removeStorage,
  getGlobalConfig,
} from './init'

import {
  isIos,
  isAndroid,
} from './util'

import {
  AUTH_PAGE_UNLOAD_TIMESTAMP,
} from './constant'

let isAuthing = false

function setAuthPageUnloadTimestamp() {
  if (isAuthing) {
    setStorage(AUTH_PAGE_UNLOAD_TIMESTAMP, getGlobalConfig().getTimestamp())
  }
}

// 记录发起授权时，页面离开时的时间戳（微信授权，可能会弹出授权提示框）
// 用作微信授权后，重定向回来判断时间是否过期
if (isIos) {
  // iOS 的 unload 不起作用，改为监听 pagehide
  window.addEventListener('pagehide', function (_) {
    setAuthPageUnloadTimestamp()
  })
}
else {
  window.addEventListener('unload', function (_) {
    setAuthPageUnloadTimestamp()
  })
}

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
// 应用授权作用域
// snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），
// snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
// const SCOPES = ['snsapi_base', 'snsapi_userinfo']

function auth(state: string, url: string, scope: string, appId: string, componentAppId?: string) {
  // 注意: 微信参数顺序和大小写有要求
  const uri = encodeURIComponent(url)
  let queryStr =  `appid=${appId}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=${state}`

  if (componentAppId) {
    queryStr += `&component_appid=${componentAppId}`
  }

  isAuthing = true
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${queryStr}#wechat_redirect`
}

export function endAuth(biz: string) {
  removeStorage(AUTH_PAGE_UNLOAD_TIMESTAMP)
}

export function normalizeShareUrl(url: string, callback?: (urlObject: Record<string, string>) => void): string {
  return normalizeUrl(url, function (urlObj: Record<string, string>) {
    if (callback) {
      callback(urlObj)
    }

    // Bugfix: https://zhuanlan.zhihu.com/p/45068949
    // 安卓系统，把 /# 变成 /?#，防止微信分享时，把链接 # 后边的字符串都截掉了，导致分享出去的链接不对
    const hasSearch = urlObj.search && urlObj.search !== '?'
    if (isAndroid && !hasSearch && urlObj.hash) {
      urlObj.hash = `?${urlObj.hash}`
    }
  })
}

export function normalizeUrl(url: string, callback?: (urlObject: Record<string, string>) => void): string {
  // 去除微信授权相关 state 和 code
  const urlObj: any = Url.parseUrl(url)

  if (!urlObj) {
    return url
  }

  if (urlObj.search) {
    const queryObj: any = Url.parseQuery(urlObj.search.slice(1))
    if (queryObj.state && queryObj.code) {
      delete queryObj.state
      delete queryObj.code

      const searchStr = Url.stringifyQuery(queryObj)
      urlObj.search = searchStr ? `?${searchStr}` : ''
    }
  }

  if (callback) {
    callback(urlObj)
  }

  return Url.stringifyUrl(urlObj)
}

// 弹出授权页面
export function startAuth(biz: string, url: string, appId: string, componentAppId?: string) {
  const state = encodeURIComponent(biz)
  const scope = 'snsapi_userinfo'

  auth(state, url, scope, appId, componentAppId)
}

// 静默授权，不弹出授权页面
export function startSilentAuth(biz: string, url: string, appId: string, componentAppId?: string) {
  const state = encodeURIComponent(biz)
  const scope = 'snsapi_base'

  auth(state, url, scope, appId, componentAppId)
}
