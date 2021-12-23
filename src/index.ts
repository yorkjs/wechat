import * as Auth from './auth'
import * as Init from './init'
import * as Query from './query'
import * as Share from './share'
import * as Pay from './pay'

export const init = Init.init
export const requestAuth = Auth.requestAuth
export const requestSilentAuth = Auth.requestSilentAuth
export const getAuthQuery = Query.getAuthQuery
export const share =  Share.share
export const pay = Pay.pay

/**
 * 版本
 */
export const version = process.env.NODE_VERSION