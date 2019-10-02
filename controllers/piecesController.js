// This controller js file contains methods for executing the URL requests for pieces

const Piece = require('../models/pieces.model.js');
let fs = require('fs');
let path = require('path');

exports.create = (req,res) => {
  // Create a piece
  console.log("Creating a new piece");

  let piece = {
    owner: req.body.owner,
    title: req.body.title,
    composer: req.body.composer,
    description: req.body.description,
    parts: req.body.parts
  }

  console.log(`piece = ${piece}`)

  let newpiece = new Piece(piece);


  console.log('saving newpiece')
  // Save a piece in the MongoDB
  newpiece.save()
  .then( data => {
    console.log("in newpiece.save")
    // Create a new directory for the piece in the public folder
    fs.mkdir(path.join(__dirname, '../public/userpieces/' + newpiece.id), { recursive: true }, (err) => {
        if (err) {
          console.dir(err)
          throw err;
        }
        console.log("making media folder")
        fs.mkdir(path.join(__dirname, '../public/userpieces/' + newpiece.id + '/media'), { recursive: true }, (err) => {
            if (err) {
              console.dir(err)
              throw err;
            }
            console.log("made media foler")
        });
        console.log("making animations folder")
        fs.mkdir(path.join(__dirname, '../public/userpieces/' + newpiece.id + '/animations'), { recursive: true }, (err) => {
            if (err) {
              console.dir(err)
              throw err;
            }
            console.log("made animation folder")
        });
        console.log("making dummy animation files")
        partsSplit = newpiece.parts.split(",")
        for (let j = 0; j < partsSplit.length; j++) {
          let firstChar = partsSplit[j].charAt(0).toUpperCase();
          let capName = firstChar + partsSplit[j].slice(1);
          let contents = "animation" + capName + " = [];";
          fs.writeFile(path.join(__dirname, '../public/userpieces/' + newpiece.id + '/animations/') + partsSplit[j] + ".js",contents,(err)=>{
            if (err) {
              console.dir(err);
              throw err;
            }
            console.log("made dummy animation file for " + partsSplit[j])
            console.log("file made at file path: " + path.join(__dirname, '../public/userpieces/' + newpiece.id + '/animations/') + partsSplit[j] + ".js");
          });
        }
    });

    //res.send(data);
    res.redirect('/form/'+newpiece._id)

  }).catch(err => {
    console.log("whoops!  "+err.message)
    res.status(500).send({
      message: err.message
    });


  });
};

// Fetch all pieces
exports.findAll = (req, res) =>  {
  console.log("Fetch all pieces");

    Piece.find()
    .then(pieces => {
        res.send(pieces);
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

// Find piece by id
exports.find = (req,res) => {
  console.log("Finding piece with id: " + req.params.pieceId);
  Piece.findById(req.params.pieceId)
  .then(piece => {
    res.send(piece);
  }).catch(err => {
    res.status(500).send({
      message: "piece not found with id " + req.params.pieceId
    });
  });
};

// Delete a piece
exports.delete = (req,res) => {
  Piece.findByIdAndRemove(req.params.pieceId)
  .then(piece => {
    if(!piece) {
      return res.status(404).send({
        message: "piece not found with id " + req.params.pieceId
      });
    }
    res.send({message: "piece deleted Successfully!"});
  }).catch(err => {
    if(err.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).send({
        message: "piece not found with id " + req.params.pieceId
      });
    }
    return res.status(500).send({
      message: "Could not delete piece with id " + req.params.pieceId
    });
  });
};

// Update a piece
exports.update = (req, res) => {
    // Find piece and update it
    const doc = {
      owner: req.body.owner,
      title: req.body.title,
      composer: req.body.composer,
      description: req.body.description,
      parts: req.body.parts
    };
    Piece.update({_id: req.params.pieceId}, doc, function(err, raw) {
      if (err) {
        return res.status(404).send({
          message: "Piece not found with id " + req.params.pieceId
        });
      }
      res.send(raw);
    }).catch(err => {
      if(err.kind === 'ObjectId') {
          return res.status(404).send({
              message: "Piece not found with id " + req.params.pieceId
          });
      }
      return res.status(500).send({
          message: "Error updating piece with id " + req.params.pieceId
      });
    });
  };
