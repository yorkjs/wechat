import * as Init from '../src/init'
import { Config } from '../src/type'
import { share } from '../src/share'

const wxMock = {
  config() {},
  ready() {},
  checkJsApi() {},

}

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
  storage: storageMock,
  getTimestamp: () => {
    return Date.now()
  },
  getSignture: (appId: string, url: string) => {
    return new Promise(function(resolve, reject) {
      const data: any = {
        appId: 'wx41a3f2fe6754da49',
        timestamp: 1639679669384,
        nonceStr: '031QKAFa1rPkiC0a8DH',
        signature: '031QKAFa1rPkiC0a8DH',
      }

      resolve(data)
    })
  }
} as Config

beforeAll(() => {
  Init.init(globalConfig)
})

describe('share', () => {
  test('share success', () => {
    const shareInfo = {
      url: 'https://test-www.finstao.com/enterprise/83377475330#/pages/main/index',
      title: 'test',
      content: 'test',
      image: 'https://img.finstao.com/f6a5f9a07851fb7092de6aff15aeee25.jpeg',
    }
    const appId = 'wx41a3f2fe6754da49'
    const url = 'https://test-www.finstao.com/enterprise/83377475330'

    share(wxMock, shareInfo, appId, url)
  })
})
