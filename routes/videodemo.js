var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('videodemo', { title: 'The Video Demo page' });
});

module.exports = router;
