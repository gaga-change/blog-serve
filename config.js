const process = require('process')

const mongoHost = process.env.MONGO_HOST || 'localhost'
const github_token = process.env.GITHUB_TOKEN || ''
const repo = process.env.GITHUB_REPO || 'test'
const port = process.env.PORT || 8080
const allowOrigin = process.env.BLOG_SERVE_ALLOW_ORIGIN || ''
const domain = process.env.BLOG_SERVE_DOMAIN || ''

module.exports = {
  // github 口令，增加github api 每小时调用的次数
  "github_token": github_token,
  // github仓库名
  "repo": repo,
  // mongodb连接地址
  "url": `mongodb://${mongoHost}:27017/blog`,
  // port 端口号
  "port": port,
  // 允许跨域的域名
  allowOrigin: allowOrigin.split(','),
  // cookie域
  domain
}