var express = require('express');
var router = express.Router();

//+ GET user/register 
router.get('/register', function(req, res, next) {
  const pageData = {
    page: 'sign up',
    menuId: 'sign up'
  };

  res.render('register', pageData);
});

//+ GET user/login
router.get('/login', function(req, res, next) {
  const pageData = {
    page: 'login',
    menuId: 'login'
  };

  res.render('login', pageData);
});

module.exports = router;
