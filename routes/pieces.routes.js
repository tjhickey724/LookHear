const fileUpload = require('express-fileupload');
let express = require('express');
let router = express.Router();

let path = require('path')
let piecesController = require('../controllers/piecesController.js');

//router.use(express.static(path.join(__dirname, '../public')));

router.get('/', (req,res) => {
  res.sendFile('/form.html');
});

router.get('/all', piecesController.findAll);

router.post('/create', piecesController.create);

router.delete('/:pieceId', piecesController.delete);

router.get('/:pieceId', piecesController.find);

router.put('/:pieceId', piecesController.update);

module.exports = router;
