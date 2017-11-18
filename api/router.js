/**
 * Created by yanjd on 2017/11/18.
 */
module.exports = function (app, router) {
  // 配置接口前缀
  app.use('/api', router)
}
