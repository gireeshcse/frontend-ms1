var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

var env = require('node-env-file');
var env_file = process.env.NODE_ENV || 'development';
env(__dirname + '/.env.'+env_file); //Load from file

var morgan = require('morgan'); // HTTP request logger
morgan('dev');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
// setup route middlewares

app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var db = require('./db');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');




app.use(express.static(path.join(__dirname, '/assets')));


app.use('/', indexRouter);
app.use('/user', userRouter);

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
    res.render('pages/error',{title:'Error Page'});
});

module.exports = app;
