var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('animatepage', { title: 'The Animation Page' });
});

module.exports = router;
