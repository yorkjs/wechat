import * as Url from '@yorkjs/url'

import { STATE_SEPARATOR } from './constant'
import { Query, QueryCheckRule } from './type'
import { getGlobalConfig, getStorage } from './init'

const stateMap = {}

function isValidTimestamp(ts :number, expireTimestamp: number): boolean {
  const globalConfig = getGlobalConfig()
  return ts > 0 && globalConfig.getTimestamp() - ts < expireTimestamp
}

function checkStorageState(storeState: string, checkRule: QueryCheckRule): boolean {

  let stateStorageValue: any = getStorage(storeState) || {}
  if (stateStorageValue && typeof stateStorageValue === 'string') {
    try {
      stateStorageValue = JSON.parse(stateStorageValue)
    }
    catch (error) {
      stateStorageValue = {}
    }
  }

  const { expireSeconds, once } = checkRule
  const { state, timestamp } = stateStorageValue
  if (state && timestamp) {
    // 1 时间是否过期
    if (expireSeconds && !isValidTimestamp(timestamp, expireSeconds * 1000)) {
      return false
    }

    // 2 是否读取过了
    if (once && stateMap[state]) {
      return false
    }

    return true
  }

  return false
}

function isEqualQueryAndStorage(query: Query) {

  const { state, timestamp } = query
  if (state && timestamp) {

    let stateStorageValue: any = getStorage(state) || {}
    if (stateStorageValue && typeof stateStorageValue === 'string') {
      try {
        stateStorageValue = JSON.parse(stateStorageValue)
      }
      catch (error) {
        stateStorageValue = {}
      }
    }

    return stateStorageValue.state === state && stateStorageValue.timestamp === timestamp
  }

  return false
}

function checkQueryState(query: Query, checkRule: QueryCheckRule): boolean {

  const { expireSeconds, once } = checkRule
  const { state, timestamp } = query
  if (state && timestamp) {

    // 1 时间是否过期
    if (expireSeconds && !isValidTimestamp(timestamp, expireSeconds * 1000)) {
      return false
    }

    // 2 是否读取过了
    if (once && stateMap[state]) {
      return false
    }

    return true
  }

  return false
}


// 解析 query
function parseAuthQuery(url: string): Query {

  const query: Query = {}

  const urlObj: any = Url.parseUrl(url)
  if (!urlObj.search) {
    return query
  }

  const queryObj: any = Url.parseQuery(urlObj.search.slice(1))
  if (queryObj.state && queryObj.code) {
    const [ state, timestamp ] = queryObj.state.split(STATE_SEPARATOR)

    query.code = queryObj.code
    query.state = state
    query.timestamp = +timestamp
  }

  return query
}

// 读取 query
export function getAuthQuery(url: string, checkRule?: QueryCheckRule): Query {

  const query: Query = parseAuthQuery(url)

  const { state, code, timestamp } = query
  if (state && code && timestamp) {

    // 1. 不需要校验
    if (!checkRule) {
      return query
    }

    const { once } = checkRule

    // 2. 校验 query 自身参数
    if (!checkQueryState(query, checkRule)) {
      return {}
    }

    // 3. 校验 storage 里的参数是否合法
    if (!checkStorageState(state, checkRule)) {
      return {}
    }

    // 4. 校验 query 和 storage 里存储的是否一致
    if (!isEqualQueryAndStorage(query)) {
      return {}
    }

    // 5. 在当前页面生命周期生效,只读一次，记录 stateMap
    if (once) {
      stateMap[state] = true
    }

  }

  return query
}
