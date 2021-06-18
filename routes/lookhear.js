var express = require('express');
var router = express.Router();
let path = require('path')
const Piece = require('../models/pieces.model.js');

router.use(express.static(path.join(__dirname, '../../')));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('lookhear', { title: 'The LookHear App' });
});

// TODO: rewrite this using async/await instead of promises ..
router.get('/:pieceId', (req,res) => {
  const pieceId = req.params.pieceId
  console.log(`pieceId=${pieceId}`)

  //let pieceId = req.url;
  //pieceId = pieceId.slice(1);
  // let pieceId = req.params.pieceId
  //let result = Piece('parts').find( { _id: pieceId });
  Piece
  .findOne({
    _id: pieceId
  })
  .then(doc => {
    console.log("inside lookhear route")
    res.locals.piece = doc
    //console.log('piece = ')
    //console.dir(res.locals.piece)
    /*
       Todo: Get rid of all of the let variables, and just pass in piece ..
       Need to replace all pieceTitle, etc. in lookhearmmodule.ejs with
       piece.title, etc.
    */
    let currPiece = doc;
    let currTitle = currPiece.title;
    let currOwner = currPiece.owner;
    let currParts = currPiece.parts;
    let currPieceId = currPiece.id;


    // res.locals.currTitle = currPiece[0].title
    console.log(currTitle);
    res.render('lookhearmodule2',
       // get rid of this stuff!
       { pieceTitle : currTitle, pieceOwner : currOwner, pieceParts : currParts, pieceId : currPieceId });
  })
  .catch(err => {
    console.error(err)
  })
});

module.exports = router;
