const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//= getting data from users database
var users = require('../models/users');

module.exports = function(passport){
    
    passport.use(new LocalStrategy(
        { usernameField: 'email'},
        (email,password,done) => {
            //= match user
            users.findOne({ email: email }, function (err, user) {
                if (err) console.log(err);

                //= if email not found
                if (!user) {
                  return done(null, false, { type: 'danger', message: 'you are not registered' });
                }

                //= if email found
                //= match password
                bcrypt.compare(password,user.password, (err,isMatch) => {
                    if (err) console.log(err);

                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null, false, { type: 'danger', message: 'invalid password' });
                    }
                }); 
            });
        }
    ));
    
    //= passport session
    passport.serializeUser( (user, done) => {
        done(null, user._id);
    });
      
    passport.deserializeUser( (_id, done) => {
        users.findById(_id, (err, user) => {
          done(err, user);
        });
    });

}

