var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');


//= getting data from users database
var users = require('../models/users');

//==============================
//= user/register route
router.get('/register', function(req, res) {
  
  res.render('register',{page: 'register'});
});
//= get user data from sign up form
router.post('/register', [
    //= check input

    check('username')
      .not().isEmpty().withMessage('username is required').bail()
      .custom( async (value) => {
        const foundUser = await users.findOne ({ username : value });
        if(foundUser){
          throw new Error('username is already taken');
        }else{
          return true;
        }
      }),

    check('email')
      .not().isEmpty().withMessage("email is required").bail()
      .isEmail().withMessage('invalid email').bail()
      .normalizeEmail()
      .custom( async (value) => {
        const foundUser = await users.findOne ({ email : value });
        if(foundUser){
          throw new Error('email is already in use');
        }else{
          return true;
        }
      }),

    check('password1')
      .not().isEmpty().withMessage('password is required').bail()
      .custom( (value,{ req }) => {
        if(value != req.body.password2){
          throw new Error('passwords dont match');
        }else {
          return true;
        }
    }),

    check('password2')
      .not().isEmpty().withMessage('confirm password is required')

  ],(req,res) =>{ 
  //= handle request and response
  const errors = validationResult(req)

  //= if errors then return to sign up form and display errors
  if (!errors.isEmpty()) {

    errors.array().forEach( error => {
      req.flash('danger',error.msg);
    });

    res.redirect('register');

  //= if no errors then register user
  }else{

    //= password encryption
    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password1, salt);


    //= if no errors then insert new user into the database
    user = new users({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    
    //= save user in database
    user.save( (err,savedUser) => {
      if (err)  return console.error(err);
    });

    //= go back to the login page
    req.flash('success','now you can login');
    res.render('login', {page: 'login'});

  }

});




//==============================

//= user/login route
router.get('/login', function(req, res) {

  res.render('login', {page: 'login'});
});

module.exports = router;
