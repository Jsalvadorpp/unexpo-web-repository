var express = require('express');
var router = express.Router();
const passport = require('passport');

//= getting data from users database
var users = require('../models/users');

//= display login page
router.get('/login', (req,res) => {
  res.render('login',{page: 'login'})
});

//= login for students
router.get('/login/student',
  passport.authenticate('google',{
    hd: "estudiante.unexpo.edu.ve",
    prompt: 'select_account',
    scope: ['email','profile'],
  })
);

//= login for professors
router.get('/login/professor',
  passport.authenticate('google',{ 
    hd: "unexpo.edu.ve",
    prompt: 'select_account',
    scope: ['email','profile'], 
  })
);

//= redirect after login
router.get('/google/redirect', 
    passport.authenticate( 'google', { 
      successRedirect: '/', // changed this from /dashboard to / cus dashboard is shit
      failureRedirect: '/',
      failureFlash: true 
}));

//= logout route
router.get('/logout', (req,res) => {
  req.logout();
  req.flash('success','Has cerrado sesión');
  res.redirect('/');
});

module.exports = router;
