var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

  const pageData = {
    page: 'home',
    menuId: 'home'
  };

  res.render('homepage', pageData);

});

module.exports = router;
