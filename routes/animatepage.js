var express = require('express');
var router = express.Router();
const Piece = require('../models/pieces.model.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('animatepage', { title: 'The Animation Page' });
});

router.get('/:pieceId', function(req, res, next) {
  let pieceId = req.url;
  pieceId = pieceId.slice(1);
  //let result = Piece('parts').find( { _id: pieceId });
  Piece
  .find({
    _id: pieceId
  })
  .then(doc => {
    console.dir(doc)
    let currPiece = doc;
    let currTitle = currPiece[0].title;
    let currOwner = currPiece[0].owner;
    let currParts = currPiece[0].parts;
    let currPieceId = currPiece[0].id;
    console.log(currTitle);
    res.render('animatepagemodule', { pieceTitle : currTitle, pieceOwner : currOwner, pieceParts : currParts, pieceId : currPieceId });
  })
  .catch(err => {
    console.error(err)
  })
});

let fs = require('fs');
let path = require('path');

router.post('/save',(req,res)=>{
  console.log('req.body is: ')
  console.dir(req.body)
  let notes = JSON.parse(req.body.notes)
  console.dir(`notes = ${notes}`)
  res.send(req.body.notes)
  let contents = "animation" + req.body.part + " = " + req.body.notes;
  fs.writeFile(path.join(__dirname, '../public/userpieces/' + req.body.pieceId + '/animations/') + req.body.part + ".js",
              contents,
              (err)=>{
                  if (err) {
                    console.dir(err);
                    throw err;
                  }
                })


  // add it to database with a mongoose.insert command ..
  // or write it to the filesystem ..
})

module.exports = router;
