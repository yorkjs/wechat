import * as Init from '../src/init'
import { Config } from '../src/type'
import { pay } from '../src/pay'

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

describe('pay', () => {
  test('pay test', () => {
    pay({}).catch(err => {
      let expected = '缺少微信环境支持'
      expect(err).toEqual(expected)
    })
  })
})
