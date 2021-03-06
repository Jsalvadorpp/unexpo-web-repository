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

        //= valid domain host
        if(profile._json.hd == 'estudiante.unexpo.edu.ve' || profile._json.hd == 'unexpo.edu.ve'){
            
            users.findOne({googleId : profile.id}, (err,user) => {
            
                //= if user is saved in the Db then login 
                if(user){
                    return done(null,user,{type: 'success', message: `Bienvenido de vuelta ${user.username}` });
               
                //= if no user is found then create a new entry in the Db
                }else{
                    //= build username from the profile data
                    const name = profile.name.givenName.split(" ");
                    const lastName = profile.name.familyName.split(" ");
                    const username = name[1] + ' ' + lastName[0];
                    //= if the user enter as professor , then add the admin role
                    let role = profile._json.hd == 'unexpo.edu.ve'? 'admin' : 'user';

                    //= create new user
                    const newProfile = new users({
                        username: username,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        role: role
                    });

                    //= save user
                    newProfile.save( (err,savedUser) => {
                        if (err)  return console.error(err);
                        return done(null, savedUser,{ type: 'success', message: 'Te has registrado correctamente' });
                    });
                }
            });

        //= invalid domain host
        }else{
            return done(null, false, { type: 'danger', message: 'Dominio de correo invalido' });
        }
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

