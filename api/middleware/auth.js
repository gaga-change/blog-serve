/**
 * Created by yanjd on 2017/11/19.
 */

const PERMISSIONS = { // 权限
  _MASTER: 1, // 最高权限
  _COMMON: 2 // 普通权限
}
/**
 * 校验权限
 * 如果返回字段 goLogin 有值，则为需要登入的接口
 */
exports.master = function (req, res, next) {
  if (req.user && req.user.permissions === PERMISSIONS._MASTER) {
    next()
  } else if (!req.user) {
    res.send({success: false, message: '用户未登入', goLogin: true})
  } else {
    res.send({success: false, message: '权限不足', goLogin: true})
  }
}
