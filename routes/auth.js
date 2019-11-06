var express = require('express');
var router = express.Router();
const passport = require('passport');

//= getting data from users database
var users = require('../models/users');

//= auth/login route
router.get('/login',
  passport.authenticate('google',{ 
    scope: ['email','profile'],
    hd: "estudiante.unexpo.edu.ve"
  })
);

router.get('/google/redirect', 
    passport.authenticate( 'google', { 
      successRedirect: '/dashboard',
      failureRedirect: '/home',
      failureFlash: true 
}));

//= logout route
router.get('/logout', (req,res) => {
  req.logout();
  req.flash('success','you are logged out');
  res.redirect('/');
});

module.exports = router;
