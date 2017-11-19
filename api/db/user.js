const User = require('../models/user_schema')
const only = require('only')

/**
 * 登入
 */
exports.login = function (req, res) {
  const user = only(req.body, 'username password')
  User.findOne({username: user.username}, function (err, findUser) {
    if (err) {
      res.send({success: false, message: err.toString()})
    } else if (!findUser || !findUser.authenticate(user.password)) {
      res.send({success: false, message: '用户名或密码错误'})
    } else {
      req.session.userId = findUser._id
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
  const user = only(req.body, 'username password')
  User.register(user, function (err, user) {
    if (err) return res.send({success: false, message: err.toString()})
    req.session.userId = user._id
    res.send({success: true})
  })
}

/**
 * 根据存储在session的用户ID获取用户信息，并保存在req.user中
 */
exports.session = function (req, res, next) {
  const userId = req.session.userId
  if (!userId) return next()
  User.findById(userId, function (err, user) {
    if (err) return res.send({success: false, message: err.toString()})
    if (user) {
      req.user = user
    }
    next()
  })
}
