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
      .not().isEmpty().withMessage('username is required')
      .custom( async (value) => {
        const foundUser = await users.findOne ({ username : value });
        if(foundUser){
          throw new Error('username is already taken');
        }else{
          return true;
        }
      }),

    check('email')
      .not().isEmpty()
      .isEmail().withMessage('invalid email')
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
      .not().isEmpty().withMessage('password is required')
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

  if (!errors.isEmpty()) {
    return res.status(400).send(errors);
  }else{

    //= password encryption
    var salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password1, salt);


    //= if no erros then insert new user into the database
    user = new users({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
 
    user.save( (err,savedUser) => {
      if (err)  return console.error(err);
    });

    res.render('login', {page: 'login'});

  }

});




//==============================

//= user/login route
router.get('/login', function(req, res) {

  res.render('login', {page: 'login'});
});

module.exports = router;
