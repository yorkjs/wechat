const userAgent = navigator.userAgent

export const isIos = /iphone|ipad/i.test(userAgent)
export const isAndroid = /android/i.test(userAgent)
