var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');

/* GET home page. */
router.get('/', (req, res, next) => {

  const pageData = {
    page: 'Material relacionado con la Ingeniería Electrónica',
  };

  res.render('homepage', pageData);

});

//= get dashboard
router.get('/dashboard', ensureAuth , (req, res, next) => {

  const pageData = {
    page: 'dashboard',
  };

  res.render('dashboard', pageData);

});

module.exports = router;
