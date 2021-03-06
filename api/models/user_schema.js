const mongoose = require('mongoose')
const crypto = require('crypto')
const Schema = mongoose.Schema
// const oAuthTypes = [ // 三方登入列表
//   'github'
// ]
const PERMISSIONS = { // 权限
  _MASTER: 1, // 最高权限
  _COMMON: 2 // 普通权限
}

const UserSchema = new Schema({
  username: {type: String, default: ''}, // 用户名
  permissions: {type: Number, default: PERMISSIONS._COMMON}, // 权限
  hashed_password: {type: String, default: ''},
  salt: {type: String, default: ''},
}, {timestamps: {createdAt: true, updateAt: true}})

/**
 * 创建虚拟属性password
 */
UserSchema.virtual('password').set(function (password) {
  this._password = password
  this.salt = this.makeSalt() // 获取随机 salt
  this.hashed_password = this.encryptPassword(password) // 加密密码
}).get(function () {
  return this._password
})

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * 创建 salt
   *
   * @return {String}
   */
  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * 验证 - 检测密码是否正确
   * 原理：使用同样的salt加密输入的密码得到的密文是否和存储的密文相同
   * @param {String} 输入的密码
   * @return {Boolean}
   */
  authenticate: function (password) {
    return this.encryptPassword(password) === this.hashed_password
  },

  /**
   * 加密 password
   *
   * @param {String} password
   * @return {String}
   */
  encryptPassword: function (password) {
    if (!password) return ''
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
    } catch (err) {
      return ''
    }
  }
}

/**
 * Static
 */
UserSchema.statics = {
  findById(userId, cb) {
    return this.findOne({_id: userId}).select('-hashed_password -salt').exec(cb)
  },
  /**
   *  注册
   * @param user
   * @param cb
   * @returns {err, user}
   */
  register(user, cb) {
    if (!(user instanceof this)) {
      user = new this(user)
    }
    if (!user.get('username')) {
      return cb(new Error('用户名不能为空'))
    }
    if (!user.get('password')) {
      return cb(new Error('密码不能为空'))
    }
    this.findOne({$or: [{username: user.get('username')}, {permissions: PERMISSIONS._MASTER}]}, function (err, existingUser) {
      if (err) {
        return cb(err)
      }
      // 如果已经有一个最高权限，则无法注册  最高权限的用户需要直接操作数据库更改
      if (existingUser && existingUser.permissions === PERMISSIONS._MASTER) {
        return cb(new Error('无权创建'))
      } else if (existingUser && existingUser.username === user.get('username')) {
        return cb(new Error('用户名已存在'))
      }
      _save()
    })

    function _save() {
      user.save(function (saveErr) {
        if (saveErr) {
          return cb(saveErr)
        }
        cb(null, user)
      })
    }
  }
}
module.exports = mongoose.model('User', UserSchema)
