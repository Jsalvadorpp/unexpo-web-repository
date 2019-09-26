var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

//+ database
var databaseName = 'Unexpo_repository'
mongoose.connect(`mongodb://localhost:27017/${databaseName}`, 
{useNewUrlParser: true,useUnifiedTopology: true });

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log(`Connected to the database: ${databaseName}`);
});

//+ set routes
var homepageRouter = require('./routes/homepage');
var usersRouter = require('./routes/users');
var userRegister = require('./routes/users-register');
var userLogin = require('./routes/users-login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//+ use routes
app.use('/', homepageRouter);
app.use('/users', usersRouter);
app.use('/register',userRegister);
app.use('/login',userLogin);

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
