var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

  const pageData = {
    page: 'sign up',
    menuId: 'sign up'
  };

  res.render('register', pageData);

});

module.exports = router;