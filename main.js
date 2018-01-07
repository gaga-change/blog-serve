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
const config = require('./config.js')
console.log('config:', config)
const mongodbUrl = config.url
mongoose.Promise = global.Promise
let app = express()

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
let cookieSet = { 
  secure: false, 
  maxAge: 24 * 60 * 60 * 1000
}
if (config.domain) {
  cookieSet.domain = config.domain
}
/* cookie解析 */
app.use(cookieParser())
/* 配置session插件 */
app.use(session({
  secret: '123456',
  name: 'sessionId', // cookie中的键名，用于存储sessionId
  cookie: cookieSet, // cookie保存的时间
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    db: 'session',
    url: mongodbUrl
  })
}))
// 跨域访问
app.all('*', function (req, res, next) {
  if (config.allowOrigin)
    for (let i = 0; i < config.allowOrigin.length; i++) {
      if (config.allowOrigin[0] === req.headers.origin) {
        res.header("Access-Control-Allow-Origin", req.headers.origin)
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        break
      }
    }
  if (req.method == 'OPTIONS') {
    res.send(200)
  }
  else {
    next()
  }
})
require('./api/router.js')(app, router) // 所有api请求

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
})

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ err });
})

mongoose.connect(mongodbUrl, { useMongoClient: true }).then(function () {
  app.listen(config.port, () => {
    console.log(`localhost:${config.port}`)
  })
})
