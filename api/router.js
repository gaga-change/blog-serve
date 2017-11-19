/**
 * Created by yanjd on 2017/11/18.
 */
const user = require('./db/user.js')
const article = require('./db/article.js')

module.exports = function (app, router) {
  app.use(function (req, res, next) {
    console.log(req.path)
    next()
  })
  /* 中间件 */
  router.use('/', user.session) // 获取session存储的用户

  /* 用户 User */
  router.post('/login', user.login) // 登入接口
  router.post('/register', user.register) // 注册接口
  router.get('/getAccount', user.getAccount) // 获取当前登入账号接口
  router.get('/logout', user.logout) // 退出登入接口

  /* 文章 */
  router.post('/article', article.add)
  router.delete('/article', article.delete)
  router.put('/article', article.modify)
  router.get('/article', article.search)

  // 配置接口前缀
  app.use('/api', router)
}


