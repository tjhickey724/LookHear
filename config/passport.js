const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

let User = require('../models/user.model.js');

let configAuth = require('./auth');

module.exports = function(passport){

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    console.log('in serializeUser ' + user)
      done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    console.log('in deserializeUser')
      User.findById(id, function(err, user) {
        done(err, user);
      });
  });

  passport.use(new GoogleStrategy({

    clientID : configAuth.googleAuth.clientID,
    clientSecret : configAuth.googleAuth.clientSecret,
    callbackURL : configAuth.googleAuth.callbackURL,
  },

  function(token, refreshToken, profile, done) {

    // Need to make asyncrhonous
    process.nextTick(function() {
      console.log("[INFO] Looking for UserId")
      // Trying to find user based on their google id
      User.findOne({ 'googleid' : profile.id }, function(err, user) {
        if (err)
          return done(err);
        if (user) {
          console.log(`[INFO] User was found ${user}`)
          // If user found, log in
          return done(null, user)
        } else {
          console.log("[INFO] We need to create a new user")
          console.dir(profile)

          let newUser = new User({
            googleid: profile.id,
            googletoken: token,
            googlename: profile.displayName,
            googleemail: profile.emails[0].value,
          });

          newUser.save(function(err) {
            console.log("[INFO] Saving the new user")
              if (err)
                throw err;
              return done(null, newUser)
          });
        }
      });
    });
  }));

};
