const fileUpload = require('express-fileupload');
let express = require('express');
let router = express.Router();

let path = require('path')
let piecesController = require('../controllers/piecesController.js');
const Piece = require('../models/pieces.model.js');


router.use(express.static(path.join(__dirname, '../../public')));

/* GET form page. */
router.get('/', function(req, res, next) {
  res.render('form', { title: 'Form Page' });
});

router.get('/uploadform', (req,res) => {
  res.render('fileupload', { title: 'Upload Page'});
});

router.get('/pieces/all', piecesController.findAll);

router.post('/pieces/create', piecesController.create);

router.delete('/pieces/:pieceId', piecesController.delete);

router.use(fileUpload());

router.post('/upload', function(req, res) {
  console.log('In upload');
  console.dir(req.files);
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  let partName = req.body.partName;

  // Use the mv() method to place the file somewhere on your server
  console.log('Sample file found: ' + sampleFile);
  sampleFile.mv(path.join(__dirname, '../public/' + partName), function(err) {
    if (err)
      return res.status(500).send(err);
    res.send('File uploaded!');
  });
});

router.get('/:pieceId', (req,res) => {
  let pieceId = req.url;
  pieceId = pieceId.slice(1);
  //let result = Piece('parts').find( { _id: pieceId });
  Piece
  .find({
    _id: pieceId
  })
  .then(doc => {
    let currPiece = doc;
    let currTitle = currPiece[0].title;
    let currOwner = currPiece[0].owner;
    let currParts = currPiece[0].parts;
    console.log(currTitle);
    res.render('fileupload', { pieceTitle : currTitle, pieceOwner : currOwner, pieceParts : currParts });
  })
  .catch(err => {
    console.error(err)
  })
});

module.exports = router;
