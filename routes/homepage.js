var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');

/* GET home page. */
router.get('/', (req, res, next) => {

  const pageData = {
    page: 'Material relacionado con Ingeniería Electrónica',
  };

  res.render('homepage', pageData);

});

module.exports = router;
