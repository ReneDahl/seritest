/**
 * This app demonstrates how to make an authenticated API with password protected users.
 * This app DOES NOT demonstrate best practices but only how to use the individual libraries.
 * Use at your own discretion.
 */

// adding build

/**** Libraries ****/
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const session = require("express-session"); // Only needed for some passport strategies
const checkJwt = require("express-jwt"); // Check for access tokens automatically
const bcrypt = require("bcryptjs"); // Used for hashing passwords!
const jwt = require("jsonwebtoken");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const twitchStrategy = require("passport-twitch.js").Strategy;

/**** Configuration ****/
const API_URL = process.env.API_URL || "https://seritest.herokuapp.com/api";
const APP_URL = process.env.APP_URL || "https://seritest.herokuapp.com:3000/";
const port = process.env.PORT || 8080;
const app = express();
const secret = "the cake is a lie";
app.use(cors());
app.use(express.static("../client/build/"));
app.use(bodyParser.json()); // Parse JSON from the request body
app.use(morgan("combined")); // Log all requests to the console
app.use(
  session({
    secret: secret,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
  })
);

// Configure Passport
passport.use(
  new LocalStrategy(function(username, password, done) {
    const user = users.find(user => user.username === username);
    if (user) {
      // If the user is found
      bcrypt.compare(password, user.hash, (err, result) => {
        if (result) {
          // If the password matched
          const payload = { username: username };
          const token = jwt.sign(payload, secret, { expiresIn: "1h" });

          return done(null, { username: username, token: token });
        } else
          done(null, false, { message: "Incorrect username or password." });
      });
    } else {
      done(null, false, { message: "User not found" });
    }
  })
);

passport.use(
  new FacebookStrategy(
    {
      clientID: "469807957025470", // TODO: Add ID!
      clientSecret: "The cake is a lie", // TODO: Add secret!
      callbackURL: `${API_URL}/users/authenticate/facebook/callback`,
      profileFields: ["id", "emails", "name"]
    },
    (accessToken, refreshToken, profile, done) => {
      const userEmail = profile.emails[0].value;
      const payload = { username: userEmail };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      done(null, {
        email: userEmail,
        username: profile.name.givenName,
        token: token
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: "", // TODO: Add ID!
      clientSecret: "", // TODO: Add secret!
      callbackURL: `${API_URL}/users/authenticate/google/callback`
    },
    function(accessToken, refreshToken, profile, done) {
      const userEmail = profile.emails[0].value;
      const payload = { username: userEmail };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      done(null, {
        email: userEmail,
        username: profile.displayName,
        token: token
      });
    }
  )
);

passport.use(
  new twitchStrategy(
    {
      clientID: "", // TODO: Add ID!
      clientSecret: "", // TODO: Add secret!
      callbackURL: `${API_URL}/users/authenticate/twitch/callback`
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      const userEmail = profile.email;
      const payload = { username: userEmail };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      done(null, {
        email: userEmail,
        username: profile.display_name,
        token: token
      });
    }
  )
);

app.use(passport.initialize());

// Open paths that do not need login. Any route not included here is protected!
let openPaths = [
  { url: /\/api\/users\/authenticate.*/gi, methods: ["POST", "GET"] }
];

// Validate the user using authentication. checkJwt checks for auth token.
app.use(checkJwt({ secret: secret }).unless({ path: openPaths }));

// This middleware checks the result of checkJwt
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    // If the user didn't authorize correctly
    res.status(401).json({ error: err.message, debug: "checkJwt" }); // Return 401 with error message.
  } else {
    next(); // If no errors, send request to next middleware or route handler
  }
});

/**** Local Users ****/

// It is recommended that you store users in MongoDB using Mongoose instead of this.
const users = [
  // These are just some test users with passwords.
  // The passwords are in clear text for testing purposes. (don't do this in production)
  { id: 0, username: "krdo@eaaa.dk", password: "123" },
  { id: 1, username: "tosk@eaaa.dk", password: "password" },
  { id: 2, username: "mvkh@eaaa.dk", password: "l33th0xor" }
];

// Creating more test data: We run through all users and add a hash of their password to each.
// Again, this is only for testing. In practice, you should hash only when adding new users.
users.forEach(user => {
  bcrypt.hash(user.password, 10, function(err, hash) {
    user.hash = hash; // The hash has been made, and is stored on the user object.
    delete user.password; // The clear text password is no longer needed
  });
});

/**** Data ****/
const data = [
  { id: 1, name: "Garfield", hobbies: ["Purring", "Sleeping", "Eating"] },
  { id: 2, name: "Tom", hobbies: ["Purring", "Eating"] },
  { id: 3, name: "Felix", hobbies: ["Sleeping", "Eating"] }
];

/**** Routes ****/
const usersRouter = require("./users_router")(users, secret, passport, APP_URL);
app.use("/api/users", usersRouter);

const kittenRouter = require("./kitten_router")(data);
app.use("/api/kittens", kittenRouter);

// "Redirect" all get requests (except for the routes specified above) to React's entry point (index.html)
// It's important to specify this route as the very last one to prevent overriding all of the other routes
app.get("*", (req, res) =>
  res.sendFile(path.resolve("..", "client", "build", "index.html"))
);

/**** Start ****/
app.listen(port, () => {
  console.log(`Auth Example API running on port ${port}!`);
});
