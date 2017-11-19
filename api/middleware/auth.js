/**
 * Created by yanjd on 2017/11/19.
 */

/**
 * 校验是否登入
 * 如果返回字段 goLogin 有值，则为需要登入的接口
 */
exports.requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.send({success: false, message: '用户未登入', goLogin: true})
  }
}
