var express = require('express');
var router = express.Router();
let path = require('path')
const Piece = require('../models/pieces.model.js');

router.use(express.static(path.join(__dirname, '../../')));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('lookhear', { title: 'The LookHear App' });
});

router.get('/:pieceId', (req,res) => {
  let pieceId = req.url;
  pieceId = pieceId.slice(1);
  // let pieceId = req.params.pieceId
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
    // res.locals.currTitle = currPiece[0].title
    console.log(currTitle);
    res.render('lookhearmodule', { pieceTitle : currTitle, pieceOwner : currOwner, pieceParts : currParts, pieceId : currPieceId });
  })
  .catch(err => {
    console.error(err)
  })
});

module.exports = router;
