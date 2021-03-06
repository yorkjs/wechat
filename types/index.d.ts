import * as Auth from './auth';
import * as Init from './init';
import * as Query from './query';
import * as Share from './share';
import * as Pay from './pay';
export declare const init: typeof Init.init;
export declare const startAuth: typeof Auth.startAuth;
export declare const startSilentAuth: typeof Auth.startSilentAuth;
export declare const endAuth: typeof Auth.endAuth;
export declare const getAuthQuery: typeof Query.getAuthQuery;
export declare const share: typeof Share.share;
export declare const pay: typeof Pay.pay;
export declare const normalizeUrl: typeof Auth.normalizeUrl;
export declare const normalizeShareUrl: typeof Auth.normalizeShareUrl;
/**
 * 版本
 */
export declare const version = "2.0.0";
