const http = require("http");
const express = require("express");
const passport = require("passport");
const app = express();

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy( {
    clientID: "",
    clientSecret: "",
    callbackURL: "http://yourdomain:3000/auth/google/callback",
    passReqToCallback: true
},
    function(request, accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
))

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));