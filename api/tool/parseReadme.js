/**
 * Created by yanjd on 2017/11/24.
 */
module.exports = function parseReadme (data) {
  let buf = Buffer.from(data, 'base64').toString()
  let str = buf.toString('utf-8')
  try {
    let arr = str.split('----------')
    if (arr.length !== 2) {
      return {err: '没有分隔符'}
    } else {
      return {
        person: arr[0],
        about: arr[1]
      }
    }
  } catch (err) {
    return {err}
  }
}
