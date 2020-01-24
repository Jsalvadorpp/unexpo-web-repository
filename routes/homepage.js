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

router.get('/faq', (req, res, next) => {

  const pageData = {
    page: 'FAQ / AYUDA',
  };

  res.render('faq', pageData);

});

module.exports = router;
