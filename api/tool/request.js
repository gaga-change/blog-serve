/**
 * Created by yanjd on 2017/11/23.
 */
const https = require('https')
const {URL} = require('url')

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    console.log('sending')
    let ret = {
      data: ''
    }
    let destroy = false // 是否因超时关闭导致的 error
    let t = Date.now()
    console.log('t', t)
    let key = null
    let req = https.request({
      hostname: new URL(options.url).hostname,
      path: new URL(options.url).pathname,
      headers: options.headers,
      method: 'GET'
    }, res => {
      clearTimeout(key)
      ret.statusCode = res.statusCode
      ret.headers = res.headers
      res.on('data', (d) => {
        ret.data += d.toString()
      })
      res.on('end', () => {
        ret.date = Date.now() - t
        resolve(ret)
      })
    })
    console.log('计时开始')
    key = setTimeout(() => {
      console.log('5秒时间到计时到')
      req.destroy()
      destroy = true
      console.log('超时', Date.now() - t, Date.now(), t)
    }, 5000)
    req.on('error', (e) => {
      if (destroy) ret.err = '请求超时'
      else ret.err = e
      ret.date = Date.now() - t
      resolve(ret)
    })
    req.end()
  })
}
