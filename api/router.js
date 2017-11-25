/**
 * Created by yanjd on 2017/11/18.
 */
const user = require('./db/user.js')
const article = require('./db/article.js')
const github = require('./db/github.js')
const other = require('./db/other.js')
const {master} = require('./middleware/auth.js')

module.exports = function (app, router) {
  app.use(function (req, res, next) {
    console.log(req.path + '\n')
    next()
  })
  /* 中间件 */
  router.use('/', user.session) // 获取session存储的用户

  /* 用户 User */
  router.post('/login', user.login) // 登入接口
  router.post('/register', user.register) // 注册接口
  router.get('/getAccount', user.getAccount) // 获取当前登入账号接口,无最高权限进登入
  router.get('/logout', user.logout) // 退出登入接口

  /* 文章 */
  router.post('/article', master, article.add)
  router.delete('/article', master, article.delete)
  router.put('/article', master, article.modify)
  router.get('/article', article.search)
  router.get('/article/class', article.searchTagNum)

  // GitHub Api
  router.post('/github/push/commit', master, github.pushCommit) // 拉取最新commit
  router.post('/github/push/tree', master, github.pushTree) // 拉取最新commit
  router.post('/github/push/file', master, github.pushFile) // 拉取文件内容
  router.post('/github/push/readme', master, github.parseReadme) // 拉取"关于我"
  router.post('/github/variable', master, github.variable) // 变量获取
  router.post('/github/clear', master, github.clear) // 清空同步内容

  // About
  router.get('/getAbout', other.getAbout)

  // 配置接口前缀
  app.use('/api', router)
}


