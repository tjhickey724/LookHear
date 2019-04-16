// This controller js file contains methods for executing the URL requests for pieces

const Piece = require('../models/pieces.model.js');
let fs = require('fs');
let path = require('path');

exports.create = (req,res) => {
  // Create a piece
  console.log("Creating a new piece");
  let newpiece = new Piece({
    owner: req.body.owner,
    title: req.body.title,
    composer: req.body.composer,
    description: req.body.description,
    parts: req.body.parts
  });

  // Save a piece in the MongoDB
  newpiece.save()
  .then( data => {
    res.send(data);
    // Create a new directory for the piece in the public folder
    fs.mkdir(path.join(__dirname, '../public/userpieces/' + newpiece.id), { recursive: true }, (err) => {
    if (err) throw err;
    });
  }).catch(err => {
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
