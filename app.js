require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate")

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3 * 60 * 60 * 1000  // 3 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_SERVER, {
  serverSelectionTimeoutMS: 150000,
  socketTimeoutMS: 150000,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  googleId: String,
  score: Number,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://naval-battles.onrender.com//auth/google/game",
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate(
      { 
        googleId: profile.id,
      }, function (err, user) {
        return cb(err, user);
      });
    }
));

let status;
let alreadyLogged;
let sameUser;

app.get("/", function(req, res) {
  res.render("home", {invalidCredentails: status});
  status = "";
});

app.get("/auth/google", passport.authenticate("google", {scope: ["profile"]}));

app.get("/auth/google/game", 
passport.authenticate('google', { failureRedirect: '/' }),
function(req, res) {
  // Successful authentication, redirect to game.
  res.redirect("/game");
}
);

app.get("/register", function(erq, res){
  res.render("register", {email: alreadyLogged, userTaken: sameUser});
  alreadyLogged = "";
  sameUser = "";
});

app.post("/register", function(req, res){
  User.findOne({ $or: [{email: req.body.email}, {username: req.body.username}]}, function(err, existingUser) {
    if (existingUser) {
      if (existingUser.email === req.body.email) {
        alreadyLogged = "You'd already logged with this email";
      } else {
        sameUser = "This username is already taken";
      }
      res.redirect("/register");
    } else {
      User.register({
        username: req.body.username,
        email: req.body.email,
        score: 0,
      }, req.body.password, function(err, user){
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("external")(req, res, function(){
            res.redirect("/game");
          });
        }
      });
    }
  });
});  

app.post("/login", function(req, res) {
  req.logout(function(err){
    if (err) {
      console.log(err);
      return res.status(500).send("An error occurred while trying to log in.");
    } else {
      User.authenticate()(req.body.username, req.body.password, function(err, user, info) {
        if (err) {
          console.error(err);
          return res.status(500).send("An error occurred while trying to log in.");
        }
        if (!user) {
          status = "invalid username or password";
          return res.redirect("/");
        }
        req.logIn(user, function(err) {
          if (err) {
            console.error(err);
            return res.status(500).send("An error occurred while trying to log in.");
          }
          return res.redirect("/game");
        });
      });
    }
  });
});

app.get("/game", function(req, res){
  if (req.isAuthenticated()){
    if (!req.user.username){
      req.session.data = {userId: req.user.googleId};
      res.redirect("/create-user");
    } else {
      console.log(req.user);
      res.render("game", {username: req.user.username, score: req.user.score});
    }
  } else {
    res.redirect("/");
  }
});

app.get("/create-user", function(req, res){
  if (req.isAuthenticated()) {
    res.render("create-user", {userTaken: sameUser});
    sameUser = "";
  } else {
    res.redirect("/");
  }
}); 

app.post("/create-user", function(req, res){
  User.findOne({username: req.body.username}, function(err, existingUser) {
    if (existingUser) {
      sameUser = "This username is already taken";
      res.redirect("/create-user");
    } else {
      const userId = req.session.data.userId;
      User.updateOne({googleId: userId}, {username: req.body.username, score: 0}, function(err){
        if(err){
          console.log(err);
          res.redirect("/")
        } else {
          res.redirect("/game")
        }
      });
    }
  });
});

app.listen(3000, function(){
    console.log("server started on port 3000");
});