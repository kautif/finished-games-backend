const http = require("http");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const { google } = require("googleapis");

const express = require("express");
const passport = require("passport");
const app = express();
const cors = require("cors");
const axios = require("axios");
const User = require("./models/userModel");
const ensureAuthenticated = require("./middleware/auth.middleware");
const {
  generateAuthToken,
  generateRefreshToken,
} = require("./services/generateTokens");

require("dotenv").config();
const cookieParser = require("cookie-parser");
const querystring = require("querystring");

app.use(express.json());
app.use(cookieParser());

const dbConnect = require("./db/dbConnect");

var GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  )
);

// app.use(cors())

const allowedOrigins = [
  "http://localhost:3000",
  "https://victorysaga.netlify.app",
  "https://victoryhistory.gg",
  "https://www.victoryhistory.gg",
];

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions)); // Apply CORS settings
app.options("*", cors(corsOptions)); // Allow preflight across all routes

dbConnect();

const backendURL = process.env.NODE_BACKEND || "http://localhost:4000";
const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";

// app.use((req, res, next) => {
//   // Allow to request from all origins
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content, Content-Type, Authorization"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, PATCH, OPTIONS"
//   );
//   next();
// });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
};

const port = normalizePort(process.env.PORT || "4000");

app.listen(port, () => {
  console.log("Server is running on port 4000");
});

app.get("/protected/userid", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }, "twitchName");
    const twitchId = await User.findOne({ _id: req.userId }, "twitchId");
    const games = await User.findOne({ _id: req.userId }, "games");
    console.log("req.userId: ", req.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send({
      message: "Hi, " + user.twitchName,
      twitchName: user.twitchName,
      twitchId: twitchId.twitchId,
      games: games.games,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/getusers", async (req, res) => {
  const users = await User.find({ twitchName: { $regex: req.query.user } });
  res.status(200).send({
    users: users,
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

//   async function sendMail(username, topic, message) {
//     const transporter = nodemailer.createTransport({
//         host: process.env.FORM_HOST,
//         secure: true,
//         secureConnection: false, // TLS requires secureConnection to be false
//         tls: {
//             ciphers:'SSLv3'
//         },
//         requireTLS:true,
//         port: 465,
//         debug: true,
//         auth: {
//             user: process.env.FORM_USER,
//             pass: process.env.FORM_PW
//         }
//     });

//       const mailOptions = {
//         from: 'support@victoryhistory.gg',
//         to: 'support@victoryhistory.gg',
//         subject: `FEEDBACK from ${username}`,
//         text: `user: ${username} \n topic: ${topic} \n message: ${message}`
//       };
//       transporter.sendMail(mailOptions, function (err, info) {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log('Email sent: ' + info.response);
//         }
//       });
//   }

app.post("/send-email", (req, res) => {
  const { username, topic, message } = req.body;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: "support@victoryhistory.gg",
    from: "support@victoryhistory.gg", // Use the email address or domain you verified above
    subject: `FEEDBACK from ${username}`,
    text: `USER: ${username} \n TOPIC: ${topic} \n MESSAGE: ${message}`,
  };
  //ES8
  (async () => {
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  })();
  // sendMail(username, topic, message);
});

app.post("/send-report", (req, res) => {
  const { user, issue, details } = req.body;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: "support@victoryhistory.gg",
    from: "support@victoryhistory.gg", // Use the email address or domain you verified above
    subject: `REPORT about ${user}`,
    text: `USER: ${user} \n ISSUE: ${issue} \n DETAILS: ${details}`,
  };
  //ES8
  (async () => {
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  })();
  sendMail(username, topic, message);
});

let accessToken;
app.get("/auth/twitch/callback", async (req, res) => {
  try {
    const { code } = req.query;
    console.log("twitch callback: ", req.body);

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const grantType = "authorization_code";
    const redirectUri = `${backendURL}/auth/twitch/callback`;

    const requestBody = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: grantType,
      redirect_uri: redirectUri,
    };

    let response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      requestBody
    );
    const responseData = await response.data;

    accessToken = responseData.access_token;
    // res.cookie("accessToken", accessToken)
    // res.cookie('auth_token', token, { httpOnly: true, sameSite: 'none', secure: true });

    // Call the Twitch API to get the user's information
    let userResponse;
    try {
      userResponse = await axios.get("https://api.twitch.tv/helix/users", {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // The access token has expired, use the refresh token to get a new one
        response = await axios.post("https://id.twitch.tv/oauth2/token", {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          refresh_token: response.data.refresh_token,
          grant_type: "refresh_token",
        });

        accessToken = response.data.access_token;
        console.log("accessToken: ", accessToken);

        // Retry the request with the new access token
        userResponse = await axios.get("https://api.twitch.tv/helix/users", {
          headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } else {
        // Some other error occurred
        throw error;
      }
    }

    const twitchUser = userResponse.data.data[0];
    // Check if the user already exists in your database
    let user = await User.findOne({ twitchId: twitchUser.id });

    // If the user doesn't exist, create a new user
    if (!user) {
      user = new User({
        twitchId: twitchUser.id,
        twitch_default: twitchUser.display_name,
        profileImageUrl: twitchUser.profile_image_url,
        twitchName: twitchUser.display_name.toLowerCase()
      });
      // res.status(200).send({
      //   twitchName: twitchUser.id,
      //   twitchId: twitchUser.display_name,
      //   games: twitchUser.games,
      // });
      await user.save();
    }

    // Generate a JWT token
    // 7/22/24: Watch to implement logout process
    const token = generateAuthToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter((t) => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;

        if (timeDiff < 86400) {
          return t;
        }
      });
    }

    await User.findByIdAndUpdate(user._id, {
      tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    });

    res.redirect(
      `${frontendURL}?verified=true&auth_token=${token}&refresh_token=${refreshToken}&twitch_token=${accessToken}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

app.get("/games", async (req, res) => {
  console.log("/games: ", req.query.twitchName);
  User.findOne({
    twitchName: req.query.twitchName,
  }).then((response) => {
    console.log("getting response: ", response);
    res.json({
      response,
    });
  });
});

let newGame;
app.post("/addgame", (req, res, next) => {
  User.findOne({
    twitchName: req.body.twitchName,
    games: {
      $elemMatch: {
        name: req.body.games.name,
      },
    },
  })
    .then((gameFound) => {
      if (gameFound.name === req.body.games.name) {
        console.log("user already has this game");
      } else {
        console.log("User will add this game");
        newGame = req.body.games;
        console.log("newGame: ", req.body.games);
      }
    })
    .catch((err) => {
      console.log("psuedo Error: User doesn't have game. Adding it");
      User.findOne({
        twitchId: req.body.twitchId,
      }).then((user) => {
        console.log("/addgame user: ", user);
        user.games.push(req.body.games);
        user
          .save()
          .then((result) => {
            res.status(201).send({
              message: `Game named ${req.body.games.name} added to ${req.body.twitchName}`,
            });
          })
          .catch((err) => {
            res.status(500).send({
              message: `Failed to add game named ${req.body.games.name} to ${req.body.twitchName}`,
              err,
            });
          });
      });
    });
});

app.put("/updategame", (req, res) => {
  User.updateOne(
    {
      twitchName: req.body.twitchName,
      "games.name": req.body.games.name,
    },
    {
      $set: {
        "games.$.summary": req.body.games.summary,
        "games.$.date_added": req.body.games.date_added,
        "games.$.rank": req.body.games.rank,
        "games.$.rating": req.body.games.rating,
      },
    }
  )
    .then(() => {
      console.log("document updated");
    })
    .catch((err) => {
      console.error("Error: ", err.message);
    });
});

app.delete("/deletegame", (req, res) => {
  const { twitchName } = req.body;
  const { name } = req.body.games;
  console.log("twitchName", twitchName);
  console.log("game", name);
  User.updateOne(
    {
      twitchName: twitchName,
    },
    {
      $pull: {
        games: {
          name: name,
        },
      },
    },
    (err, result) => {
      if (err) throw err;
      console.log(result.modifiedCount + " game(s) deleted");
    }
  );
});

app.delete("/deleteuser", (req, res) => {
  const { twitchName } = req.body;
  User.deleteOne({ twitchName: twitchName}, (err, result) => {
    if (err) {
      throw err;
    } else {
      console.log(`delete user ${twitchName}: `, result);
    }
  })
})

app.get("/api/user/", (req, res, next) => {
  console.log("user: ", req.query.username);
  User.findOne({
    twitchName: req.query.username,
  })
    .then((userFound) => {
      console.log("userFound: ", userFound);
      res.status(200).send({
        user: userFound,
      });
    })
    .catch((err) => {
      console.log("user not found: ", err);
    });
});

app.post("/logout", async (req, res) => {
  console.log("logging out");
  const token = req.headers["authorization"];

  if (!token) {
    console.log("No token found");
    return res.status(400).send({ message: "No token found" });
  }
  try {
    await axios.post(
      "https://id.twitch.tv/oauth2/revoke",
      querystring.stringify({
        client_id: process.env.TWITCH_CLIENT_ID,
        token: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  } catch (err) {
    console.log("Error revoking token: ", err.message);
    // return res.status(500).send({ message: 'Failed to revoke token' });
  }

  // const authHeader = `Basic ${Buffer.from(`${process.env.TWITCH_CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`;
  // response = await fetch('https://id.twitch.tv/oauth2/revoke', {
  //     method: "POST",
  //     headers: {
  //         'Authorization': authHeader,
  //         'Content-Type': "application/x-www-form-urlencoded",
  //     },
  //     body:  new URLSearchParams({
  //         client_id: process.env.TWITCH_CLIENT_ID,
  //         token: req.body.accessToken
  //       })
  // })

  res.status(200).send({ message: "Logged out successfully" });
  return res;
});

// Route for token generation (login simulation)
app.get("/validated-auth-token", ensureAuthenticated, (req, res) => {
  return res.status(200).json("Auth Token is Valid");
});
