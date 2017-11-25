/**
 * Created by yanjd on 2017/11/22.
 */

// const {GitHubCommit} = require('../models/user_schema')
const {GitHubCommit, GitHubTree, GitHubFile, Variable, Other} = require('../models/github_schema')
const Article = require('../models/article_schema')
const myRequest = require('../tool/request')
const parseBlog = require('../tool/parseBlog')
const parseReadme = require('../tool/parseReadme')
const config = require('../../hide.config.json')
const co = require('co')
const async = co.wrap
const only = require('only')

const Headers = {
  'User-Agent': 'gaga-change',
  'Authorization': 'token ' + config.github_token
}

/**
 * 变量操控
 * 无参 获取变量
 * init:true 初始化变量
 */
exports.variable = async(function* (req, res, next) {
  const params = only(req.body, 'init')
  try {
    let already = yield Variable.findOne({})
    if (already && params.init) { // 存在且需要初始化
      yield already.remove()
      already = null
    }
    if (!already) {
      const v = yield new Variable({}).save()
      res.send({variable: v})
    } else {
      res.send({variable: already})
    }
  } catch (err) {
    next(err)
  }
})

// 清空同步内容
exports.clear = async(function* (req, res, next) {
  try {
    yield GitHubCommit.remove({})
    yield GitHubTree.remove({})
    yield GitHubFile.remove({})
    yield Variable.remove({})
    yield new Variable({}).save()
    res.send({msg: 'success'})
  } catch (err) {
    next(err)
  }
})


// 存储Commit
exports.pushCommit = async(function* (req, res, next) {
  try {
    const commitApiData = yield myRequest({ // GitHub API 请求
      url: `https://api.github.com/repos/gaga-change/${config.repo}/commits?page=1&per_page=1`,
      headers: Headers
    })
    if (commitApiData.err) { // 请求报错
      res.send({err: commitApiData.err, msg: commitApiData.msg, time: commitApiData.date})
    } else if (_parse(commitApiData.data).err) { // 解析报错
      res.send({err: _parse(commitApiData.data).err, msg: _parse(commitApiData.data).msg})
    } else {
      const commit = new GitHubCommit(_parse(commitApiData.data).obj[0])
      const already = yield GitHubCommit.findOne({sha: commit.sha})
      if (already) { // 如果已经存在
        res.send({already: true, time: commitApiData.date, commit, headers: commitApiData.headers})
      } else {
        commit.date = commit.commit.committer.date
        yield commit.save()
        res.send({already: false, time: commitApiData.date, headers: commitApiData.headers})
      }
    }
  } catch (err) {
    next(err)
  }
})

// 一次存储一个目录层级
/**
 * trees
 *  - 空 根据Commit 获取第一层级，进入不为空
 *  - 不为空
 *    - Pop trees -> API 获取当前目录内容 -> 存储目录、子目录、子文件
 *  -> 返回 当前目录,未排查目录
 */
exports.pushTree = async(function* (req, res, next) {
  try {
    const variable = yield Variable.findOne({})
    const trees = variable.trees
    if (trees.length === 0) {
      const commit = yield GitHubCommit.findOne().sort({date: -1})
      if (!commit) return res.send({err: true, msg: '无提交日志'}) // 如果没有日志，直接结束 end
      trees.push(commit.commit.tree)
    }
    const tree = trees.pop() // 只包含自身信息，不带子目录和子文件信息
    const already = yield GitHubTree.findOne({sha: tree.sha}) // 查看是否已存在该目录
    if (already) {
      yield variable.save()
      return res.send({already: true, variable, tree: already}) // 如果已拉取过，直接结束  end
    }
    const treeApiData = yield myRequest({ // GitHub API 请求
      url: tree.url,
      headers: Headers
    })
    if (treeApiData.err) { // 请求报错
      trees.push(tree) // 没有成功，填回去
      res.send({err: treeApiData.err, msg: treeApiData.msg, time: treeApiData.date})
    } else if (_parse(treeApiData.data).err) { // 解析报错
      res.send({err: _parse(treeApiData.data).err, msg: _parse(treeApiData.data).msg})
    } else { // 数据正常
      let treeSonList = _parse(treeApiData.data).obj // 目录下的子文件和子目录
      treeSonList.path = tree.path || '主目录'
      yield new GitHubTree(treeSonList).save()
      treeSonList.tree.filter(v => v.type === 'tree').forEach(v => trees.push(v))
      treeSonList.tree.filter(v => v.type === 'blob').forEach(v => variable.files.push(v))
      yield variable.save()
      res.send({already: false, time: treeApiData.date, variable, tree: treeSonList})
    }
  } catch (err) {
    next(err)
  }
})

// 保存文件
exports.pushFile = async(function* (req, res, next) {
  try {
    const variable = yield Variable.findOne({}).sort({date: -1})
    const files = variable.files
    if (files.length === 0) { // 文件为空，代表所有文件拉取完毕
      return res.send({already: true, variable})
    }
    const file = files.pop()
    const already = yield GitHubFile.findOne({sha: file.sha}) // 查看是否已存在该目录
    if (already) {
      yield variable.save()
      return res.send({already: true, variable, file: already}) // 如果已拉取过，直接结束  end
    }
    const fileApiData = yield myRequest({ // GitHub API 请求
      url: file.url,
      headers: Headers
    })
    if (fileApiData.err) { // 请求报错
      files.push(file) // 填回
      res.send({err: fileApiData.err, msg: fileApiData.msg, time: fileApiData.date})
    } else if (_parse(fileApiData.data).err) { // 解析报错
      res.send({err: _parse(fileApiData.data).err, msg: _parse(fileApiData.data).msg})
    } else {
      let fileContent = _parse(fileApiData.data).obj // 文件带内容信息
      fileContent.path = file.path
      yield new GitHubFile(fileContent).save()
      let blog = parseBlog(fileContent.content)
      if (!blog.err) yield Article.update({blog: blog.blog}, blog, {upsert: true})
      yield variable.save()
      res.send({already: false, time: fileApiData.date, variable, file, blog})
    }
  } catch (err) {
    next(err)
  }
})

// 拉取“关于我”
exports.parseReadme = async(function* (req, res, next) {
  try {
    const commit = yield GitHubCommit.findOne().sort({date: -1})
    if (!commit) return res.send({err: true, msg: '无提交日志'}) // 如果没有日志，直接结束 end
    const tree = yield GitHubTree.findOne({sha: commit.commit.tree.sha}).select('tree tree.path tree.sha')
    if (!tree) return res.send({err: true, msg: '无主目录'})
    let readme = tree.tree.filter(v => v.path === 'README.md')[0]
    if (!readme) return res.send({err: true, msg: '目录无README.md 文件'})
    readme = yield GitHubFile.findOne({sha: readme.sha})
    if (!readme) return res.send({err: true, msg: 'DB无README.md 文件内容'})
    const parse = parseReadme(readme.content)
    if (parse.err) return res.send({err: parse.err, msg: '解析失败'})
    parse.type = 'about'
    let about = yield Other.update({type: 'about'}, parse, {upsert: true})
    res.send({about})
  } catch (err) {
    next(err)
  }
})

function _parse(str) {
  try {
    const item = JSON.parse(str)
    if (typeof item === 'object') {
      return {obj: item}
    } else {
      return {err: true, msg: 'JSON解析后不是 object'}
    }
  } catch (err) {
    return {err, msg: 'JSON解析失败'}
  }
}
