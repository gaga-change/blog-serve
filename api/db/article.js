const Article = require('../models/article_schema')
const only = require('only')
const assign = Object.assign

/**
 * 增 文章
 */

exports.add = function (req, res) {
  const article = new Article(only(req.body, 'title intro imageUrl content push'))
  if (req.body.tags) article.tags = req.body.tags.split(',')
  article.save(function (err, article) {
    if (err) res.send({err})
    else res.send({article})
  })
}

/**
 * 删 根据id删除文章
 */

exports.delete = function (req, res) {
  const params = only(req.body, 'id')
  Article.remove({_id: params.id}, function (err, msg) {
    if (err) res.send({err})
    else res.send({msg})
  })
}

/**
 * 改 修改文章
 */

exports.modify = function (req, res) {
  const params = only(req.body, 'title intro imageUrl content push tags')
  if (params.tags) params.tags = params.tags.split(',')
  const id = req.body.id
  Article.update({_id: id}, params, function (err, msg) {
    if (err) res.send({err})
    else res.send({msg})
  })
}

/**
 * 查 获取文章列表
 * 1. 单个查询  id
 * 2. 多条查询  page limit
 * 3. 筛选项 hot：点击量最高 push：推荐 title: 标题模糊查询
 */

exports.search = function (req, res) {
  const params = only(req.query, 'id page limit push hot title tag')
  const page = (params.page > 0 ? params.page : 1) - 1
  const limit = Number(params.limit)
  const _id = params.id
  const title = params.title
  const push = params.push
  const hot = params.hot
  const tag = params.tag

  const options = {
    limit: limit,
    page: page
  }
  // 筛选
  options.criteria = {}
  // 排序
  options.sort = {createdAt: -1} // 默认根据时间排序
  if (_id) options.criteria._id = _id
  if (title) options.criteria.title = new RegExp('(' + title + ')', 'i')
  if (push) options.criteria.push = push
  if (tag) options.criteria.tags = tag
  if (hot) {
    if (Number(hot) === -1)
      options.sort = {clickNum: -1}
    else {
      options.sort = {clickNum: 1}
    }
  } // 根据点击量排序
  Article.list(options).then((articles) => {
    if (_id) { // 如果是查询某一个文章，则直接访问量添 1
      let article = articles[0]
      article.clickNum = article.clickNum + 1
      article.save(function (err) {
        if (err) res.send({err})
        else res.send({article})
      })
    } else {
      Article.count(options.criteria, function (err, count) {
        if (err) res.send({err})
        else res.send({
          list: articles,
          page: page + 1,
          count: count,
          pages: Math.ceil(count / limit)
        })
      })
    }
  })
}

/**
 * 高级查询 每个标签下文章的数量
 */
exports.searchTagNum = function (req, res) {
  Article.aggregate(
    [
      {
        $unwind: {path: "$tags"}
      },
      {
        $group: {_id: "$tags", count: {$sum: 1}}
      }
    ]).exec(function (err, msg) {
    res.send({err, msg})
  })
}
