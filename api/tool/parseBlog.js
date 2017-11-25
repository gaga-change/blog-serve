/**
 * Created by yanjd on 2017/11/23.
 */
module.exports = function parseBlog (data) {
  let buf = Buffer.from(data, 'base64').toString()
  let str = buf.toString('utf-8')
  try {
    const ret = {
      title: '', // 标题
      intro: '', // 简介
      imageUrl: '', // 图片路径
      content: '', // 内容
      push: '', // 是否放入推荐列表
      tags: [], // 标签
      date: '', // 时间
      blog: '' // 是否发布,改字段唯一
    }
    let arr = str.split(/---/)
    if (arr.length < 3) return {err: '没有 ---'} // 没有 --- end
    if (str.indexOf('[image]') === -1) return {err: '没有图片'} // 没有图片路径 end
    let header = arr[1] // 头部
    if (header.indexOf('title: ') === -1 || header.indexOf('tags: ') === -1 || header.indexOf('date: ') === -1 || header.indexOf('blog: ') === -1 || header.indexOf('push: ') === -1) return {err: '没有 title|tags|date|blog'} // 5个参数校验
    header = header.split('\n').join('').split(/(title: |tags: |date: |blog: |push: )/).filter(v => v.length)
    if (header.length !== 10) return {err: '5个参数解析异常'}
    header = header.map(v => v.trim())
    ret.title = header[1]
    ret.tags = header[3].split(',')
    ret.date = new Date(header[5])
    ret.blog = header[7]
    ret.push = header[9] === 'true'
    arr.shift()
    arr.shift()
    let body = arr.join('') // 内容
    ret.imageUrl = body.split('[image]:')[1].trim()
    ret.intro = body.split('\n')[2].split('>')[1].trim()
    ret.content = data
    return ret
  } catch (err) {
    return {err}
  }
}
