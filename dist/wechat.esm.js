/**
 * wechat.js v1.3.0
 * (c) 2021 shushu2013
 * Released under the MIT License.
 */

import * as Url from '@yorkjs/url';

const STORAGE_PREFIX = '@@wechat@@';
const STATE_SEPARATOR = '@';

let globalConfig;
function init$1(config) {
    globalConfig = config;
}
function getGlobalConfig() {
    return globalConfig;
}
function getStorage(key) {
    return globalConfig.storage.get(`${STORAGE_PREFIX}_${key}`);
}
function setStorage(key, value) {
    globalConfig.storage.set(`${STORAGE_PREFIX}_${key}`, value);
}
function removeStorage(key) {
    globalConfig.storage.remove(`${STORAGE_PREFIX}_${key}`);
}

// https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
// 应用授权作用域
// snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），
// snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
// const SCOPES = ['snsapi_base', 'snsapi_userinfo']
function auth(state, url, scope, appId, componentAppId) {
    // 注意: 微信参数顺序和大小写有要求
    const uri = encodeURIComponent(url);
    let queryStr = `appid=${appId}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=${state}`;
    if (componentAppId) {
        queryStr += `&component_appid=${componentAppId}`;
    }
    location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${queryStr}#wechat_redirect`;
}
function endAuth$1(biz) {
    removeStorage(biz);
}
// 弹出授权页面
function startAuth$1(biz, url, appId, componentAppId) {
    const timestamp = getGlobalConfig().getTimestamp();
    const state = encodeURIComponent(`${biz}${STATE_SEPARATOR}${timestamp}`);
    const scope = 'snsapi_userinfo';
    setStorage(biz, JSON.stringify({
        state: biz,
        timestamp,
    }));
    auth(state, url, scope, appId, componentAppId);
}
// 静默授权，不弹出授权页面
function startSilentAuth$1(biz, url, appId, componentAppId) {
    const timestamp = getGlobalConfig().getTimestamp();
    const state = encodeURIComponent(`${biz}${STATE_SEPARATOR}${timestamp}`);
    const scope = 'snsapi_base';
    setStorage(biz, JSON.stringify({
        state: biz,
        timestamp,
    }));
    auth(state, url, scope, appId, componentAppId);
}

const stateMap = {};
function isValidTimestamp(ts, expireTimestamp) {
    const globalConfig = getGlobalConfig();
    return ts > 0 && globalConfig.getTimestamp() - ts < expireTimestamp;
}
function checkStorageState(storeState, checkRule) {
    let stateStorageValue = getStorage(storeState) || {};
    if (stateStorageValue && typeof stateStorageValue === 'string') {
        try {
            stateStorageValue = JSON.parse(stateStorageValue);
        }
        catch (error) {
            stateStorageValue = {};
        }
    }
    const { expireSeconds, once } = checkRule;
    const { state, timestamp } = stateStorageValue;
    if (state && timestamp) {
        // 1 时间是否过期
        if (expireSeconds && !isValidTimestamp(timestamp, expireSeconds * 1000)) {
            return false;
        }
        // 2 是否读取过了
        if (once && stateMap[state]) {
            return false;
        }
        return true;
    }
    return false;
}
function isEqualQueryAndStorage(query) {
    const { state, timestamp } = query;
    if (state && timestamp) {
        let stateStorageValue = getStorage(state) || {};
        if (stateStorageValue && typeof stateStorageValue === 'string') {
            try {
                stateStorageValue = JSON.parse(stateStorageValue);
            }
            catch (error) {
                stateStorageValue = {};
            }
        }
        return stateStorageValue.state === state && stateStorageValue.timestamp === timestamp;
    }
    return false;
}
function checkQueryState(query, checkRule) {
    const { expireSeconds, once } = checkRule;
    const { state, timestamp } = query;
    if (state && timestamp) {
        // 1 时间是否过期
        if (expireSeconds && !isValidTimestamp(timestamp, expireSeconds * 1000)) {
            return false;
        }
        // 2 是否读取过了
        if (once && stateMap[state]) {
            return false;
        }
        return true;
    }
    return false;
}
// 解析 query
function parseAuthQuery(url) {
    const query = {};
    const urlObj = Url.parseUrl(url);
    if (!urlObj.search) {
        return query;
    }
    const queryObj = Url.parseQuery(urlObj.search.slice(1));
    if (queryObj.state && queryObj.code) {
        const [state, timestamp] = queryObj.state.split(STATE_SEPARATOR);
        query.code = queryObj.code;
        query.state = state;
        query.timestamp = +timestamp;
    }
    return query;
}
// 读取 query
function getAuthQuery$1(url, checkRule) {
    const query = parseAuthQuery(url);
    const { state, code, timestamp } = query;
    if (state && code && timestamp) {
        // 1. 不需要校验
        if (!checkRule) {
            return query;
        }
        const { once } = checkRule;
        // 2. 校验 query 自身参数
        if (!checkQueryState(query, checkRule)) {
            return {};
        }
        // 3. 校验 storage 里的参数是否合法
        if (!checkStorageState(state, checkRule)) {
            return {};
        }
        // 4. 校验 query 和 storage 里存储的是否一致
        if (!isEqualQueryAndStorage(query)) {
            return {};
        }
        // 5. 在当前页面生命周期生效,只读一次，记录 stateMap
        if (once) {
            stateMap[state] = true;
        }
    }
    return query;
}

function share$1(wx, signature, jsApiList, shareInfo, debug = false) {
    return new Promise(function (resolve, reject) {
        // config 信息验证后会执行 ready 方法，所有接口调用都必须在 config 接口获得结果之后，
        // config 是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
        // 则须把相关接口放在 ready 函数中调用来确保正确执行
        wx.config({
            debug,
            appId: signature.appId,
            timestamp: signature.timestamp,
            nonceStr: signature.nonceStr,
            signature: signature.signature,
            jsApiList
        });
        wx.ready(function () {
            wx.checkJsApi({
                jsApiList,
                success(res) {
                    const result = res.checkResult;
                    if (result.updateAppMessageShareData) {
                        wx.updateAppMessageShareData({
                            title: shareInfo.title,
                            desc: shareInfo.content,
                            link: shareInfo.url,
                            imgUrl: shareInfo.image
                        });
                    }
                    if (result.updateTimelineShareData) {
                        wx.updateTimelineShareData({
                            title: shareInfo.title,
                            link: shareInfo.url,
                            imgUrl: shareInfo.image,
                        });
                    }
                    if (result.onMenuShareWeibo) {
                        wx.onMenuShareWeibo({
                            title: shareInfo.title,
                            desc: shareInfo.content,
                            link: shareInfo.url,
                            imgUrl: shareInfo.image
                        });
                    }
                    // 旧版,用来适配Android
                    if (result.onMenuShareAppMessage) {
                        // 即将废弃
                        wx.onMenuShareAppMessage({
                            title: shareInfo.title,
                            desc: shareInfo.content,
                            link: shareInfo.url,
                            imgUrl: shareInfo.image
                        });
                    }
                    if (result.onMenuShareTimeline) {
                        // 即将废弃
                        wx.onMenuShareTimeline({
                            title: shareInfo.title,
                            link: shareInfo.url,
                            imgUrl: shareInfo.image,
                        });
                    }
                }
            });
        });
        wx.error(function (res) {
            // config 信息验证失败会执行 error 函数，如签名过期导致验证失败，
            // 具体错误信息可以打开 config 的 debug 模式查看，
            // 也可以在返回的 res 参数中查看，对于 SPA 可以在这里更新签名
            reject(res);
        });
        resolve();
    });
}

function pay$1(params) {
    return new Promise(function (resolve, reject) {
        if (window.WeixinJSBridge) {
            window.WeixinJSBridge.invoke('getBrandWCPayRequest', params, function (res) {
                const { err_msg } = res;
                if (err_msg == 'get_brand_wcpay_request:ok') {
                    resolve(res);
                }
                else if (err_msg !== 'get_brand_wcpay_request:cancel') {
                    reject(err_msg || '支付失败');
                }
            });
        }
        else {
            reject('缺少微信环境支持');
        }
    });
}

const init = init$1;
const startAuth = startAuth$1;
const startSilentAuth = startSilentAuth$1;
const endAuth = endAuth$1;
const getAuthQuery = getAuthQuery$1;
const share = share$1;
const pay = pay$1;
/**
 * 版本
 */
const version = "1.3.0";

export { endAuth, getAuthQuery, init, pay, share, startAuth, startSilentAuth, version };
//# sourceMappingURL=wechat.esm.js.map
