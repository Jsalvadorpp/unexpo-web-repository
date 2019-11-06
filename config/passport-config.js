const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()

//= getting data from users database
var users = require('../models/users');

module.exports = function(passport){

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_clientID,
        clientSecret: process.env.GOOGLE_clientSecret,
        callbackURL: process.env.GOOGLE_callbackURL
      },
      function(accessToken, refreshToken, profile, done) {

        users.findOne({googleId : profile.id}, (err,user) => {
            
            if(user){
               return done(null,user);
            }else{
                //= build username from the profile data
                const name = profile.name.givenName.split(" ");
                const lastName = profile.name.familyName.split(" ");
                const username = name[1] + ' ' + lastName[0];

                //= create new user
                const newProfile = new users({
                    username: username,
                    email: profile.emails[0].value,
                    googleId: profile.id
                });

                newProfile.save( (err,savedUser) => {
                    if (err)  return console.error(err);
                    return done(null, savedUser);
                });
            }
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

