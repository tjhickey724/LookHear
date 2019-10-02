const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const crypto = require('crypto');
const multer = require('multer');
const GridFSStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Configuration of database

let dbConfig = require('./config/mongodb.config.js');
let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connection to database
/*
const conn = mongoose.createConnection(dbConfig.url);

// Inititate gridFS
let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('fs');
})
*/

mongoose.connect( dbConfig.url, { useNewUrlParser: true } );
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});



// Create storage engine
const storage = new GridFSStorage({
  url: dbConfig.url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketname: 'fs'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage })

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

// route GET /uploadvideo
// Loads from
app.get('/uploadvideo', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('uploadvideo', {files: false});
    } else {
      res.render('uploadvideo', {files: files});
    }
  });
});

// route POST /upload
// Upload files to DB
app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('uploadvideo');
});

// route GET /files
// displays all files in json
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files found
    return res.json(files);
  });
});

// route GET /files/:filename
// displays all files in json
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename}, (err, file) => {
    // Check if exists
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // File exists

    // Check if video
    if (file.contentType === 'video/mp4') {
      // Read output
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      return res.json(file);
    }
  });
});

// route DELETE /files/:id
// Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'fs'}, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect('/uploadvideo');
  });
});

let indexRouter = require('./routes/index');
let lookhearRouter = require('./routes/lookhear');
let videodemoRouter = require('./routes/videodemo');
let multivideodemoRouter = require('./routes/multivideodemo');
let usersRouter = require('./routes/users');
let animatepageRouter = require('./routes/animatepage');
let piecesRouter = require('./routes/pieces.routes');
let formRouter = require('./routes/form');

//app.use('/', lookhearRouter);
app.use('/lookhear', lookhearRouter);
app.use('/videodemo', videodemoRouter);
app.use('/multivideodemo', multivideodemoRouter);
app.use('/users', usersRouter);
app.use('/animatepage', animatepageRouter);
app.use('/pieces', piecesRouter);
app.use('/form', formRouter);

// Piece actions

//app.get('/pieces/all',piecesController.findAll);
//app.post('/pieces/create',piecesController.create);
//app.delete('/pieces/delete/:pieceId',piecesController.delete);

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
