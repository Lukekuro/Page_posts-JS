/**
 * this is like a index.php
 */

const { log } = require('console');

const express = require('express'),
session = require('express-session'),
MongoStore = require('connect-mongo'),
flash = require('connect-flash'),
router = require('./router'),
markdown = require('marked'),
sanitizeHTML = require("sanitize-html"), // safe before hack via text. this remove script, code
csrf = require('csurf'),
app = express();

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/api', require('./router-api'))

let sessionOptions = session({
  secret: "JavaScript is sooooooooo coool",
  store: MongoStore.create({client: require('./db')}),
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next) { // thanks to 'next'

  //make our markdown function available from within ejs templates
  res.locals.filterUserHTML = function(content) {
    return sanitizeHTML(markdown.parse(content), {allowedTags: ['p', 'br', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'italic', 'i', 'em'], allowedAttributes: {}} )
  }

  //make all error and success flash messages available from all templates
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')

  //make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id
  } else {
    req.visitorId = 0
  }

  //make user session data available from within view templates
  res.locals.user = req.session.user // create a new option for ejs (user.avatar) instead (avatar)
  next();
})



app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(csrf())

app.use(function(req, res, next) { // safe before hack to your site e.g. form, login...
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use('/', router)

app.use(function(err, req, res, next) {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") { // check if error with csrftoken
      req.flash('errors', 'Cross site request forgery detected.')
      req.session.save(() => res.redirect('/'))
    } else {
      res.redirect('404')
    }
  }
})

const server = require('http').createServer(app),  //to http from server as app
io = require('socket.io')(server); //enable connect from server(db) to client

io.use(function(socket, next) {
  sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket) {
  // console.log("a new user connected"); //test

  let user = socket.request.session.user
  if (user) {
    socket.emit('welcome', {username: user.username, avatar: user.avatar}) // new (send one person)

    socket.on('chatMessageFromBrowser', function(data) { //on is getting from emit 
      // console.log(data.message); // test message
      // io.emit('chatMessageFromServer', {message: data.message, username: user.username, avatar: user.avatar})  // old (send one person and display two person)
      // allowedTags: [] - it means you can add/use tags
      socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar}) // new (get one person)
    })
  }
 
})

module.exports = server