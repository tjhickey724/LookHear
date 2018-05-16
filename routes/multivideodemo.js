var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('multivideodemo', { title: 'The Multiple Video Demo page' });
});

module.exports = router;
