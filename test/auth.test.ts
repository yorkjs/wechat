import * as Init from '../src/init'
import { Config } from '../src/type'
import * as Auth from '../src/auth'

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

})

describe('Auth', () => {
  describe('normalizeUrl', () => {
    test('no state and code', () => {
      let url = 'https://test-www.finstao.com/enterprise/83377475330#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      let result = Auth.normalizeUrl(url)

      let expected = 'https://test-www.finstao.com/enterprise/83377475330#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      expect(result).toEqual(expected)

      url = 'https://test-www.finstao.com/enterprise/83377475330?kk=test&a=1'
      result = Auth.normalizeUrl(url)

      expected = 'https://test-www.finstao.com/enterprise/83377475330?kk=test&a=1'
      expect(result).toEqual(expected)
    })

    test('has state and code', () => {
      const url = 'https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_try_bind%401639679669384&code=061b5BFa1xEliC04g7Ga1mlCQg2b5BFV&state=wechat_try_bind%401639679992118&code=021zQ0000FsVXM1FeH100647LZ1zQ00f&state=wechat_try_bind%401639680102278#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      const result = Auth.normalizeUrl(url)

      let expected = 'https://test-www.finstao.com/enterprise/83377475330#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      expect(result).toEqual(expected)
    })

    test('with callback', () => {
      const url = 'https://test-www.finstao.com/enterprise/83377475330?code=031QKAFa1rPkiC0a8DHa1r3fx23QKAFm&state=wechat_try_bind%401639679669384&code=061b5BFa1xEliC04g7Ga1mlCQg2b5BFV&state=wechat_try_bind%401639679992118&code=021zQ0000FsVXM1FeH100647LZ1zQ00f&state=wechat_try_bind%401639680102278#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      const result = Auth.normalizeUrl(url, (urlObject: any) => {
        if (urlObject.search) {
          urlObject.search += '&test=true'
        }
        else {
          urlObject.search = '?test=true'
        }
      })

      let expected = 'https://test-www.finstao.com/enterprise/83377475330?test=true#/pages/mall/product/order/index?count=1&sku_id=70559864181'
      expect(result).toEqual(expected)
    })
  })
})
