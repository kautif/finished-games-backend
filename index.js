const http = require("http");
const express = require("express");
const passport = require("passport");
const app = express();
const cors = require("cors");
const jwt = require("jwt-decode");
require('dotenv').config();

const dbConnect = require("./db/dbConnect");

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy( {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://yourdomain:3000/auth/google/callback",
    passReqToCallback: true
},
    function(request, accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
))

// app.use(cors())

const allowedOrigins = [
    "http://localhost:3000",
  ];
  
  const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
    credentials: true,
  };
  
  app.use(cors(corsOptions));

dbConnect();

// app.use((req, res, next) => {
//     // Allow to request from all origins
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Content-Type, Authorization");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
//     next();
// })  

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

const port = normalizePort(process.env.PORT || "4000");

app.listen(port, () => {
    console.log('Server is running on port 4000');
});

app.post('/balls', (req, res) => {
    console.log("BALLS: ", req);
})

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.post('/auth/twitch/callback', async (req, res) => {
    // Extract authorization code from the request
    const code = req.query.code;

    try {
        // Make a POST request to Twitch's token endpoint to exchange the authorization code for an access token
        const response = await axios.post('https://id.twitch.tv/oauth2/token', {
            client_id: 'your_client_id',
            client_secret: 'your_client_secret',
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:4000/auth/twitch/callback' // Must match the registered URI exactly
        });

        // Once you receive the access token, you may want to store it securely and associate it with the user's session
        const accessToken = response.data.access_token;
        // Store accessToken and perform further actions like redirecting the user

        // Redirect the user to the root URL or any other appropriate page
        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: true, // Ensure cookie is sent over HTTPS
            sameSite: 'none' // Set SameSite attribute to None
        }).redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));