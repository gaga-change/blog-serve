/**
 * Created by yanjd on 2017/11/22.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
* 提交列表
* https://api.github.com/repos/gaga-change/test/commits?page=1&per_page=8
* 目录
* https://api.github.com/repos/gaga-change/test/git/trees/f4de76cf72b16c9a1ee49e53923adc3e9fc81ca2
* 文件内容
* https://api.github.com/repos/gaga-change/test/git/blobs/83c831f0b085c70509b1fbb0a0131a9a32e691ac
* */
module.exports.GitHubCommit = mongoose.model('GitHubCommit', new Schema({
  sha: {type: String},
  commit: {type: Object},
  date: {type: Date}
}))

module.exports.GitHubTree = mongoose.model('GitHubTree', new Schema({
  sha: {type: String},
  path: {type: String},
  tree: {type: Array}
}))

module.exports.GitHubFile = mongoose.model('GitHubFile', new Schema({
  sha: {type: String},
  path: {type: String},
  size: {type: Number},
  content: {type: String}
}))

module.exports.Other = mongoose.model('Other', new Schema({}, {strict: false}))

module.exports.Variable = mongoose.model('Variable', new Schema({
  trees: {type: Array, default: []},
  files: {type: Array, default: []}
}))
