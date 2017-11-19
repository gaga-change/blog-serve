const User = require('../models/user_schema')
const only = require('only')

/**
 * 登入
 */
exports.login = function (req, res) {
  const user = only(req.body, 'username password')
  User.findOne({$or: [{username: user.username}, {email: user.username}]}, function (err, findUser) {
    if (err) {
      res.send({success: false, message: err.toString()})
    } else if (!findUser) {
      res.send({success: false, message: '用户名或邮箱不存在'})
    } else if (!findUser.authenticate(user.password)) {
      res.send({success: false, message: '密码错误'})
    } else {
      req.session.userId = findUser._id
      req.session.modifyNum = findUser.modifyNum
      res.send({success: true, message: '登入成功', user: only(findUser, '-hashed_password -salt')})
    }
  })
}

/**
 * 退出登入（删除session）
 */
exports.logout = function (req, res) {
  req.session.destroy(function (err) {
    if (err) return res.send({success: false, message: err.toString()})
    res.send({success: true})
  })
}

/**
 * 获取当前登入用户
 */
exports.getAccount = function (req, res) {
  if (req.user) {
    res.send({success: true, account: req.user})
  } else {
    res.send({success: true, account: null})
  }
}

/**
 * 注册
 */
exports.register = function (req, res) {
  const user = only(req.body, 'username password email')
  User.register(user, function (err, user) {
    if (err) return res.send({success: false, message: err.toString()})
    req.session.userId = user._id
    req.session.modifyNum = user.modifyNum
    res.send({success: true})
  })
}

/**
 * 根据存储在session的用户ID获取用户信息，并保存在req.user中
 */
exports.session = function (req, res, next) {
  const userId = req.session.userId
  const modifyNum = req.session.modifyNum
  if (!userId) return next()
  User.findById(userId, function (err, user) {
    if (err) return res.send({success: false, message: err.toString()})
    if (user && user.modifyNum === modifyNum) {
      req.user = user
    }
    next()
  })
}
