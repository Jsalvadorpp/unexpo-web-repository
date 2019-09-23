var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

  const pageData = {
    page: 'login',
    menuId: 'login'
  };

  res.render('login', pageData);

});

module.exports = router;