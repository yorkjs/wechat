import * as Auth from './auth';
import * as Init from './init';
import * as Query from './query';
import * as Share from './share';
import * as Pay from './pay';
export declare const init: typeof Init.init;
export declare const requestAuth: typeof Auth.requestAuth;
export declare const requestSilentAuth: typeof Auth.requestSilentAuth;
export declare const getAuthQuery: typeof Query.getAuthQuery;
export declare const share: typeof Share.share;
export declare const pay: typeof Pay.pay;
/**
 * 版本
 */
export declare const version = "0.0.1";
