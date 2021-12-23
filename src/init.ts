import { Config } from './type'
import { STORAGE_PREFIX } from './constant'

let globalConfig: Config

export function init(config: Config) {
  globalConfig = config
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
