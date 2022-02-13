import * as Url from '@yorkjs/url'
import * as Auth from '../src/auth'
import { AUTH_PAGE_UNLOAD_TIMESTAMP } from '../src/constant'
import * as Init from '../src/init'
import * as queryUtil from '../src/query'
import { Config, Query } from '../src/type'

const store = {}
const storageMock = {
  get(key: string) {
    return store[key]
  },
  set(key: string, value: any) {
    store[key] = value
  },
  remove(key: string) {
    delete store[key]
  },
}

const globalConfig = {
  getTimestamp: () => {
    return Date.now()
  },
  storage: storageMock
} as Config

beforeAll(() => {
  Init.init(globalConfig)

  // 模拟 window.location
  let hrefUrl = ''
  const location: any = new URL('https://www.example.com')
  Object.defineProperty(location, 'href', {
      set(url) {
        const urlObj = Url.parseUrl(url)

        if (!urlObj || !urlObj.search) {
          return url
        }

        const queryObj: any = Url.parseQuery(urlObj.search.slice(1))
        const { redirect_uri, state } = queryObj

        if (redirect_uri && state) {
          const randomCode = `${Math.random()}`.slice(6)
          const query = {
            state: state,
            code: `WXCODE_TEST_${randomCode}`
          }

          const redirectUrlObj = Url.parseUrl(decodeURIComponent(redirect_uri))
          if (!redirectUrlObj) {
            return url
          }

          if (redirectUrlObj.search) {
            redirectUrlObj.search += '&' + Url.stringifyQuery(query)
          }
          else {
            redirectUrlObj.search = '?' + Url.stringifyQuery(query)
          }
          Init.setStorage(AUTH_PAGE_UNLOAD_TIMESTAMP, globalConfig.getTimestamp())

          // console.log(Url.stringifyUrl(redirectUrlObj))
          hrefUrl = Url.stringifyUrl(redirectUrlObj)
        }

        return url
      },
      get() {
        return hrefUrl
      }
  })

  delete (window as any).location
  window.location = location
})

describe('test query getAuthQuery', () => {
  describe('getAuthQuery no checkRule', () => {
    test('url has state', () => {
      let url = 'https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_try_bind&code=061b5BFa1xEliC04g7Ga1mlCQg2b5BFV&state=wechat_try_bind&code=021zQ0000FsVXM1FeH100647LZ1zQ00f&state=wechat_try_bind#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      let expected = {}

      // 第一次读取
      let result = queryUtil.getAuthQuery(url)
      expected = {
        code: '021zQ0000FsVXM1FeH100647LZ1zQ00f',
        state: 'wechat_try_bind',
      }

      expect(result).toEqual(expected)

      // 第二次读取
      result = queryUtil.getAuthQuery(url)
      expect(result).toEqual(expected)
    })

    test('url no state', () => {
      let url = 'https://test-www.finstao.com/enterprise/83377475330'

      let result = queryUtil.getAuthQuery(url)
      let expected: Query = {}

      expect(result).toEqual(expected)

      url = 'https://test-www.finstao.com/enterprise/83377475330#/pages/mall/product/detail?state=wechat_try_bind&code=061b5BFa1xEliC04g7Ga1mlCQg2b5BFV'

      result = queryUtil.getAuthQuery(url)
      expected = {}

      expect(result).toEqual(expected)
    })
  })

  describe('getAuthQuery has checkRule', () => {
    test('expireSeconds', (done) => {
      let url = `https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_pay`
      let expected: Query = {}

      // 先发起请求
      Auth.startAuth('wechat_try_bind', url, 'wx41a3f2fe6754da49')

      // 第一次读取，从 href 读出回调的地址
      url = window.location.href
      let result = queryUtil.getAuthQuery(url, { expireSeconds: 10 })
      expected = {
        state: 'wechat_try_bind',
      }

      expect(result).toMatchObject(expected)

      // 第二次读取
      result = queryUtil.getAuthQuery(url, { expireSeconds: 10 })
      expected = {
        state: 'wechat_try_bind',
      }

      expect(result).toMatchObject(expected)

      // 第三次，超时读取
      setTimeout(() => {
        result = queryUtil.getAuthQuery(url, { expireSeconds: 1 })
        expected = {}

        expect(result).toEqual(expected)

        done()
      }, 1100)
    })

    test('expireSeconds invalid', (done) => {
      let url = `https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_pay`
      let expected: Query = {}

      // 先发起请求
      Auth.startAuth('wechat_try_bind', url, 'wx41a3f2fe6754da49')

      url = window.location.href

      setTimeout(() => {
        let result = queryUtil.getAuthQuery(url, { expireSeconds: 1 })
        expected = {}

        expect(result).toEqual(expected)

        done()
      }, 1100)
    })

    test('once sucess', () => {
      let url = `https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_pay`
      let expected: Query = {}

      // 先发起请求
      Auth.startAuth('wechat_try_bind', url, 'wx41a3f2fe6754da49')

      // 第一次读取
      url = window.location.href
      let result = queryUtil.getAuthQuery(url, { once: true })
      expected = {
        state: 'wechat_try_bind',
      }

      expect(result).toMatchObject(expected)

      // 第二次读取
      result = queryUtil.getAuthQuery(url, { once: true })
      expected = {}

      expect(result).toEqual(expected)
    })

    test('once and expireSeconds', () => {
      let url = `https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_pay`
      let expected: Query = {}

      // 先发起请求
      Auth.startAuth('wechat_try_pay', url, 'wx41a3f2fe6754da49')

      // 第一次读取
      url = window.location.href
      let result = queryUtil.getAuthQuery(url, { once: true, expireSeconds: 10 })
      expected = {
        state: 'wechat_try_pay',
      }

      expect(result).toMatchObject(expected)
      expect(result.code).toMatch(/WXCODE_TEST_\d+/)

      // 第二次读取
      result = queryUtil.getAuthQuery(url, { once: true, expireSeconds: 10 })
      expected = {}

      expect(result).toEqual(expected)
    })
  })

  describe('startAuth and endAuth', () => {
    test('endAuth', () => {
      let url = `https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_pay`
      let expected: Query = {}

      // 先发起请求
      Auth.startAuth('wechat_try_bind', url, 'wx41a3f2fe6754da49')

      // 第一次读取，从 href 读出回调的地址
      url = window.location.href
      let result = queryUtil.getAuthQuery(url, { expireSeconds: 10 })
      expected = {
        state: 'wechat_try_bind',
      }

      expect(result).toMatchObject(expected)

      // 第二次读取
      result = queryUtil.getAuthQuery(url, { expireSeconds: 10 })
      expected = {
        state: 'wechat_try_bind',
      }

      expect(result).toMatchObject(expected)

      // 授权结束
      Auth.endAuth('wechat_try_bind')

      // 第三次，超时读取
      result = queryUtil.getAuthQuery(url, { expireSeconds: 10 })
      expected = {}

      expect(result).toEqual(expected)
    })
  })
})
