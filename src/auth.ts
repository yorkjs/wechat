import {
  setStorage,
  getGlobalConfig,
} from './init'
import { STATE_SEPARATOR } from './constant'

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

  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${queryStr}#wechat_redirect`
}

// 弹出授权页面
export function requestAuth(biz: string, url: string, appId: string, componentAppId?: string) {
  const timestamp = getGlobalConfig().getTimestamp()
  const state = encodeURIComponent(`${biz}${STATE_SEPARATOR}${timestamp}`)
  const scope = 'snsapi_userinfo'

  setStorage(
    biz,
    JSON.stringify({
      state: biz,
      timestamp,
    })
  )

  auth(state, url, scope, appId, componentAppId)
}

// 静默授权，不弹出授权页面
export function requestSilentAuth(biz: string, url: string, appId: string, componentAppId?: string) {
  const timestamp = getGlobalConfig().getTimestamp()
  const state = encodeURIComponent(`${biz}${STATE_SEPARATOR}${timestamp}`)
  const scope = 'snsapi_base'

  setStorage(
    biz,
    JSON.stringify({
      state: biz,
      timestamp,
    })
  )

  auth(state, url, scope, appId, componentAppId)
}
