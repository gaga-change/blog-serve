/**
 * Created by yanjd on 2017/11/18.
 */
const express = require('express')
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const router = require('express').Router()
const config = require('./hide.config.json')
const mongodbUrl = config && config.url ? config.url : 'mongodb://localhost/blog'
mongoose.Promise = global.Promise
let app = express()

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded
/* cookie解析 */
app.use(cookieParser())
/* 配置session插件 */
app.use(session({
  secret: '123456',
  name: 'sessionId', // cookie中的键名，用于存储sessionId
  cookie: {secure: false, maxAge: 24 * 60 * 60 * 1000}, // cookie保存的时间
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    host: 'localhost',
    port: 27017,
    db: 'session',
    url: mongodbUrl
  })
}))

require('./api/router.js')(app, router) // 所有api请求

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
})

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({err});
})

mongoose.connect(mongodbUrl, {useMongoClient: true}).then(function () {
  app.listen(8080, () => {
    console.log('localhost:8080')
  })
})
