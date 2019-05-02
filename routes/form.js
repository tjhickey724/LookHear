const fileUpload = require('express-fileupload');
let express = require('express');
let router = express.Router();

let path = require('path')
let piecesController = require('../controllers/piecesController.js');
const Piece = require('../models/pieces.model.js');
let animateRouter = require('./animatepage.js');


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

router.put('/pieces/:pieceId', piecesController.update);

router.use(fileUpload());

router.post('/upload', function(req, res) {
  console.log('In upload');
  console.dir(req.files);
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let uploadId = req.body.pieceId;
// ADD A TRY/CATCH SO YOU DONT KILL SYSTEM
  let files = [].concat(req.files.file);
  let partNames = [].concat(req.body.partName);
  partNames = ['altus','cantus'];
  let partLength = partNames.length;
  let partOptions = ['.jpg','.mp4'];
  for(let x = 0; x < files.length; x++){
    files[x].mv(path.join(__dirname, '../public/userpieces/' + uploadId + '/media/' + partNames[Math.floor(x/partLength)] + partOptions[(x%2)]), function(err) {
      console.log("saved file to " + '../public/userpieces/' + uploadId + '/media/' + partNames[Math.floor(x/partLength)] + ' ' + (x/partLength) + ' '+ partOptions[(x%2)]);
      if (err) {console.log("ERROR"); console.dir(err); throw err}
    });
  }
  res.send('Files uploaded!');
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
    let currPieceId = currPiece[0].id;
    console.log(currTitle);
    res.render('fileupload', { pieceTitle : currTitle, pieceOwner : currOwner, pieceParts : currParts, pieceId : currPieceId });
  })
  .catch(err => {
    console.error(err)
  })
});

module.exports = router;
