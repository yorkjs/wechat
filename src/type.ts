type Storage = {
  get: (key: string) => any,
  set: (key: string, value: any) => void,
  remove: (key: string) => void,
}

export type Query = {
  code?: string,
  state?: string,
  timestamp?: number,
}

export type QueryCheckRule = {
  expireSeconds?: number,
  once?: boolean,
}

export interface Config {
  storage: Storage,
  getTimestamp: () => number,
}
