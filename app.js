require('dotenv').config();
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    flash = require('connect-flash'),
    methodOverride = require('method-override');
seedDB = require("./seeds");

var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes = require('./routes/comments'),
    authRoutes = require('./routes/index');

mongoose.connect("mongodb://localhost:27017/yelpcamp", {
    useNewUrlParser: true
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"));
app.use(flash());

// Seed the database
seedDB();

// Require MomentJS
app.locals.moment = require('moment');

// Passport Configuration
app.use(require('express-session')({
    secret: "Random",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Landing Page for YelpCamp
app.get("/", function (req, res) {
    res.render("landing");
});

// ROUTES 
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use(authRoutes);

// Start server
app.listen(3000, process.env.IP, function (req, res) {
    console.log("Server has started");
});