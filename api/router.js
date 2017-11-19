/**
 * Created by yanjd on 2017/11/18.
 */
const user = require('./db/user.js')

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

  // 配置接口前缀
  app.use('/api', router)
}


