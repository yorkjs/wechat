import * as Url from '@yorkjs/url'

import { AUTH_PAGE_UNLOAD_TIMESTAMP } from './constant'
import { Query, QueryCheckRule } from './type'
import { getGlobalConfig, getStorage } from './init'

const stateMap = {}

function isValidTimestamp(expireTimestamp: number): boolean {
  const nowTimestamp = getGlobalConfig().getTimestamp()
  const authPageUnloadTimestamp = getStorage(AUTH_PAGE_UNLOAD_TIMESTAMP)

  if (authPageUnloadTimestamp) {
    return nowTimestamp - authPageUnloadTimestamp < expireTimestamp
  }

  return false
}

function checkQueryState(query: Query, checkRule: QueryCheckRule): boolean {

  const { expireSeconds, once } = checkRule
  const { state } = query
  if (state) {

    // 1 时间是否过期
    if (expireSeconds && !isValidTimestamp(expireSeconds * 1000)) {
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
    query.code = queryObj.code
    query.state = queryObj.state
  }

  return query
}

// 读取 query
export function getAuthQuery(url: string, checkRule?: QueryCheckRule): Query {

  const query: Query = parseAuthQuery(url)

  const { state, code } = query
  if (state && code) {

    // 1. 不需要校验
    if (!checkRule) {
      return query
    }

    const { once } = checkRule

    // 2. 校验 query 自身参数
    if (!checkQueryState(query, checkRule)) {
      return {}
    }

    // 3. 在当前页面生命周期生效,只读一次，记录 stateMap
    if (once) {
      stateMap[state] = true
    }

  }

  return query
}
