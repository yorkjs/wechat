/**
 * wechat.js v1.2.1
 * (c) 2021 shushu2013
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@yorkjs/url')) :
  typeof define === 'function' && define.amd ? define(['exports', '@yorkjs/url'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Url = {}, global.Url));
})(this, (function (exports, Url) { 'use strict';

  var STORAGE_PREFIX = '@@wechat@@';
  var STATE_SEPARATOR = '@';

  var globalConfig;
  function init$1(config) {
      globalConfig = config;
  }
  function getGlobalConfig() {
      return globalConfig;
  }
  function getStorage(key) {
      return globalConfig.storage.get((STORAGE_PREFIX + "_" + key));
  }
  function setStorage(key, value) {
      globalConfig.storage.set((STORAGE_PREFIX + "_" + key), value);
  }
  function removeStorage(key) {
      globalConfig.storage.remove((STORAGE_PREFIX + "_" + key));
  }

  // https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Official_Accounts/official_account_website_authorization.html
  // 应用授权作用域
  // snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），
  // snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
  // const SCOPES = ['snsapi_base', 'snsapi_userinfo']
  function auth(state, url, scope, appId, componentAppId) {
      // 注意: 微信参数顺序和大小写有要求
      var uri = encodeURIComponent(url);
      var queryStr = "appid=" + appId + "&redirect_uri=" + uri + "&response_type=code&scope=" + scope + "&state=" + state;
      if (componentAppId) {
          queryStr += "&component_appid=" + componentAppId;
      }
      location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?" + queryStr + "#wechat_redirect";
  }
  function endAuth$1(biz) {
      removeStorage(biz);
  }
  // 弹出授权页面
  function startAuth$1(biz, url, appId, componentAppId) {
      var timestamp = getGlobalConfig().getTimestamp();
      var state = encodeURIComponent(("" + biz + STATE_SEPARATOR + timestamp));
      var scope = 'snsapi_userinfo';
      setStorage(biz, JSON.stringify({
          state: biz,
          timestamp: timestamp,
      }));
      auth(state, url, scope, appId, componentAppId);
  }
  // 静默授权，不弹出授权页面
  function startSilentAuth$1(biz, url, appId, componentAppId) {
      var timestamp = getGlobalConfig().getTimestamp();
      var state = encodeURIComponent(("" + biz + STATE_SEPARATOR + timestamp));
      var scope = 'snsapi_base';
      setStorage(biz, JSON.stringify({
          state: biz,
          timestamp: timestamp,
      }));
      auth(state, url, scope, appId, componentAppId);
  }

  var stateMap = {};
  function isValidTimestamp(ts, expireTimestamp) {
      var globalConfig = getGlobalConfig();
      return ts > 0 && globalConfig.getTimestamp() - ts < expireTimestamp;
  }
  function checkStorageState(storeState, checkRule) {
      var stateStorageValue = getStorage(storeState) || {};
      if (stateStorageValue && typeof stateStorageValue === 'string') {
          try {
              stateStorageValue = JSON.parse(stateStorageValue);
          }
          catch (error) {
              stateStorageValue = {};
          }
      }
      var expireSeconds = checkRule.expireSeconds;
      var once = checkRule.once;
      var state = stateStorageValue.state;
      var timestamp = stateStorageValue.timestamp;
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
      var state = query.state;
      var timestamp = query.timestamp;
      if (state && timestamp) {
          var stateStorageValue = getStorage(state) || {};
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
      var expireSeconds = checkRule.expireSeconds;
      var once = checkRule.once;
      var state = query.state;
      var timestamp = query.timestamp;
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
      var query = {};
      var urlObj = Url.parseUrl(url);
      if (!urlObj.search) {
          return query;
      }
      var queryObj = Url.parseQuery(urlObj.search.slice(1));
      if (queryObj.state && queryObj.code) {
          var ref = queryObj.state.split(STATE_SEPARATOR);
          var state = ref[0];
          var timestamp = ref[1];
          query.code = queryObj.code;
          query.state = state;
          query.timestamp = +timestamp;
      }
      return query;
  }
  // 读取 query
  function getAuthQuery$1(url, checkRule) {
      var query = parseAuthQuery(url);
      var state = query.state;
      var code = query.code;
      var timestamp = query.timestamp;
      if (state && code && timestamp) {
          // 1. 不需要校验
          if (!checkRule) {
              return query;
          }
          var once = checkRule.once;
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

  function share$1(wx, signature, shareInfo, debug) {
      if ( debug === void 0 ) debug = false;

      return new Promise(function (resolve, reject) {
          var jsApiList = [
              'onMenuShareAppMessage',
              'onMenuShareTimeline',
              'updateAppMessageShareData',
              'updateTimelineShareData',
              'onMenuShareWeibo',
              'previewImage' ];
          wx.config({
              debug: debug,
              appId: signature.appId,
              timestamp: signature.timestamp,
              nonceStr: signature.nonceStr,
              signature: signature.signature,
              jsApiList: jsApiList
          });
          wx.ready(function () {
              wx.checkJsApi({
                  jsApiList: jsApiList,
                  success: function(res) {
                      var result = res.checkResult;
                      if (result.updateAppMessageShareData) {
                          wx.updateAppMessageShareData({
                              title: shareInfo.title,
                              desc: shareInfo.content,
                              link: shareInfo.url,
                              imgUrl: shareInfo.image
                          });
                      }
                      // 旧版,用来适配Android
                      if (result.onMenuShareAppMessage) {
                          wx.onMenuShareAppMessage({
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
                      if (result.onMenuShareTimeline) {
                          wx.onMenuShareTimeline({
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
                  }
              });
          });
          resolve();
      });
  }

  function pay$1(params) {
      return new Promise(function (resolve, reject) {
          if (window.WeixinJSBridge) {
              window.WeixinJSBridge.invoke('getBrandWCPayRequest', params, function (res) {
                  var err_msg = res.err_msg;
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

  var init = init$1;
  var startAuth = startAuth$1;
  var startSilentAuth = startSilentAuth$1;
  var endAuth = endAuth$1;
  var getAuthQuery = getAuthQuery$1;
  var share = share$1;
  var pay = pay$1;
  /**
   * 版本
   */
  var version = "1.2.1";

  exports.endAuth = endAuth;
  exports.getAuthQuery = getAuthQuery;
  exports.init = init;
  exports.pay = pay;
  exports.share = share;
  exports.startAuth = startAuth;
  exports.startSilentAuth = startSilentAuth;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=wechat.js.map
