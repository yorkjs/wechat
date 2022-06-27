import { Config } from './type'
import { STORAGE_PREFIX } from './constant'
import { setAuthPageUnloadTimestamp } from './auth'

let globalConfig: Config

export function init(config: Config) {
  globalConfig = config

  // 记录发起授权时，页面离开时的时间戳（微信授权，可能会弹出授权提示框）
  // 用作微信授权后，重定向回来判断时间是否过期
  config.onPageLeave(setAuthPageUnloadTimestamp)
}

export function getGlobalConfig(): Config {
  return globalConfig
}

export function getStorage(key: string): any {
  return globalConfig.storage.get(`${STORAGE_PREFIX}_${key}`)
}

export function setStorage(key: string, value: any) {
  globalConfig.storage.set(`${STORAGE_PREFIX}_${key}`, value)
}

export function removeStorage(key: string) {
  globalConfig.storage.remove(`${STORAGE_PREFIX}_${key}`)
}
