const {Other} = require('../models/github_schema')
const co = require('co')
const async = co.wrap
const only = require('only')

/**
 * 获取关于我
 * person:true 仅仅返回person
 * @type {Function}
 */
exports.getAbout = async(function* (req, res, next) {
  const params = only(req.query, 'person')
  try {
    if(params.person) {
      const about = yield Other.findOne({type: 'about'}).select('person')
      res.send({err: !about, about})
    } else {
      const about = yield Other.findOne({type: 'about'}).select('person about')
      console.log(about)
      res.send({err: !about, about})
    }
  } catch (err) {
    next(err)
  }
})