const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Article Schema
 */
const ArticleSchema = new Schema({
  blog: {type: String, default: ''}, // 博客唯一id
  title: {type: String, default: ''}, // 标题
  intro: {type: String, default: ''}, // 简介
  imageUrl: {type: String, default: ''}, // 图片路径
  content: {type: String, default: ''}, // 内容
  push: {type: Boolean, default: false}, // 是否放入推荐列表
  tags: {type: Array, default: []}, // 标签
  clickNum: {type: Number, default: 0}, // 阅读量
  commentNum: {type: Number, default: 0}, // 评论数
  date: {type: Date, default: Date.now()} // 界面显示的创建时间
}, {timestamps: {createdAt: true, updateAt: true}})

/**
 * 静态方法
 */

ArticleSchema.statics = {

  /**
   * 通过id找到相应文章
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function (_id) {
    return this.findOne({_id})
      .exec()
  },

  /**
   * 查询文章列表
   *
   * @param {Object} options
   * @api private
   */

  list: function (options) {
    const criteria = options.criteria || {}
    const page = options.page || 0
    const limit = options.limit || 30
    if (criteria._id) {
      return this.find(criteria)
        .limit(limit)
        .skip(limit * page)
        .exec()
    } else {
      return this.find(criteria)
        .select('-content')
        .sort(options.sort)
        .limit(limit)
        .skip(limit * page)
        .exec()
    }
  }
}

module.exports = mongoose.model('Article', ArticleSchema)
