var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const database = require('./config/databaseConfig');
const methodOverride = require('method-override')

//= passport config 
require('./config/passport-config')(passport);

//= connect to database
var databaseName = database.databaseName;
database.connect;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log(`Connected to the database: ${databaseName}`);
});

//= set routes
var homepageRouter = require('./routes/homepage');
var authRouter = require('./routes/auth');
var uploadRouter = require('./routes/upload');
var filesRouter = require('./routes/files');
var tagsRouter = require('./routes/tags');

//= initialize express app
var app = express();

//= view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//= packages middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '---',
  saveUninitialized: true,
  resave: true}));
app.use(flash());
//= express messages middleware 
app.use( (req, res, next) => {
  //= local to messages
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(passport.initialize());
app.use(passport.session());
//= middleware to check if user is logged
app.use( (req,res,next) => {
  res.locals.userIsLogged = req.isAuthenticated();
  res.locals.user = req.user;
  next();
});
//= middleware for method Override
app.use(methodOverride('_method'))

//= use routes
app.use('/', homepageRouter);
app.use('/auth', authRouter);
app.use('/upload',uploadRouter);
app.use('/files',filesRouter);
app.use('/tags',tagsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
