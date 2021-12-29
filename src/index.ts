import * as Auth from './auth'
import * as Init from './init'
import * as Query from './query'
import * as Share from './share'
import * as Pay from './pay'

export const init = Init.init
export const startAuth = Auth.startAuth
export const startSilentAuth = Auth.startSilentAuth
export const endAuth = Auth.endAuth
export const getAuthQuery = Query.getAuthQuery
export const share =  Share.share
export const pay = Pay.pay
export const normalizeUrl = Auth.normalizeUrl

/**
 * 版本
 */
export const version = process.env.NODE_VERSION