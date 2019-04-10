let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();

// Configuration of database

let dbConfig = require('./config/mongodb.config.js');
let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connection to database

mongoose.connect(dbConfig.url).then(() => {
  console.log("Successfully connected to MongoDB.");
}).catch(err => {
  console.log('Could not connect to MongoDB.');
  process.exit();
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', 4000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// to handle all static routes
app.use(express.static(path.join(__dirname, 'public')));

let indexRouter = require('./routes/index');
let lookhearRouter = require('./routes/lookhear');
let videodemoRouter = require('./routes/videodemo');
let multivideodemoRouter = require('./routes/multivideodemo');
let usersRouter = require('./routes/users');
let animatepageRouter = require('./routes/animatepage');
let piecesRouter = require('./routes/pieces.routes');
let formRouter = require('./routes/form');

let piecesController = require('./controllers/piecesController');

app.use('/', lookhearRouter);
app.use('/lookhear', lookhearRouter);
app.use('/videodemo', videodemoRouter);
app.use('/multivideodemo', multivideodemoRouter);
app.use('/users', usersRouter);
app.use('/animatepage', animatepageRouter);
app.use('/pieces', piecesRouter);
app.use('/form', formRouter);

app.get('/pieces/all',piecesController.findAll);
app.post('/pieces/create',piecesController.create);

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
