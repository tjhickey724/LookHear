const fileUpload = require('express-fileupload');
let express = require('express');
let router = express.Router();

let path = require('path')
let pieces = require('../controllers/piecesController.js');

router.use(express.static(path.join(__dirname, '../public')));

  // Save a piece to MongoDB
  //router.post('/pieces/create', pieces.create);
/*
  // Retrieve all pieces
  router.get('/pieces/all', pieces.findAll);

  // Delete a Piece with Id
  router.delete('/pieces/:pieceId', pieces.delete);

  router.use((req,res,next)=> {
    console.log('old posts work');
    next()
  });


  // default options
  router.use(fileUpload());

  router.post('/upload', function(req, res) {
    console.log('In upload');
    console.dir(req.files);
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    console.log('Sample file found: ' + sampleFile);
    sampleFile.mv(path.join(__dirname, '../../public/file'), function(err) {
      if (err)
        return res.status(500).send(err);
      res.send('File uploaded!');
    });
  });


  router.use((req,res,next)=> {
    console.log('file upload works');
    next()
  });

router.use("*", (req,res) => {
  res.sendFile("/404.html");
});

// Delete a Piece with Id
router.delete('/pieces/:pieceId', pieces.delete);
*/
module.exports = router;
