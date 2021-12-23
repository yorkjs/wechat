import * as Init from '../src/init'
import { Config, SignParams } from '../src/type'
import { share } from '../src/share'

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
  jssdkSignture: (params: SignParams) => {
    return new Promise(function(resolve, reject) {
      const response: any = {
        code: 0,
        data: {
          appId: 'wx41a3f2fe6754da49',
          timestamp: 1639679669384,
          nonceStr: '031QKAFa1rPkiC0a8DH',
          signature: '031QKAFa1rPkiC0a8DH',
        }
      }

      resolve(response)
    })
  }
} as Config

beforeAll(() => {
  Init.init(globalConfig)

})

describe('share', () => {
  test('isWechat false', () => {
    const shareInfo = {
      url: 'https://test-www.finstao.com/enterprise/83377475330#/pages/main/index',
      title: 'test',
      content: 'test',
      image: 'https://img.finstao.com/f6a5f9a07851fb7092de6aff15aeee25.jpeg',
    }
    const appId = 'wx41a3f2fe6754da49'
    const appType = 1

    share(shareInfo, appId, appType)
  })

  test('isWechat true', () => {
    const shareInfo = {
      url: 'https://test-www.finstao.com/enterprise/83377475330#/pages/main/index',
      title: 'test',
      content: 'test',
      image: 'https://img.finstao.com/f6a5f9a07851fb7092de6aff15aeee25.jpeg',
    }
    const appId = 'wx41a3f2fe6754da49'
    const appType = 1

    share(shareInfo, appId, appType, true)
  })
})
