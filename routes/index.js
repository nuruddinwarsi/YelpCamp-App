var express = require('express');
var router = express.Router();

var passport = require('passport');

var User = require('../models/user'),
	Campground = require('../models/campground');

// show register form
router.get('/register', function (req, res) {
	res.render('register', {
		page: 'register'
	})
});

// handle signup
router.post('/register', function (req, res) {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
	})
	if (req.body.adminCode === 'Looserpool') {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function (err, user) {
		if (err) {
			req.flash('error', err.message)
			return res.redirect('/register')
		} else {
			passport.authenticate('local')(req, res, function () {
				req.flash('success', 'Welcome to YelpCamp ' + user.username)
				res.redirect('/campgrounds')
			})
		}
	})
});

// show login form
router.get('/login', function (req, res) {
	res.render('login', {
		page: 'login'
	})
});
// handle login
router.post('/login', passport.authenticate('local', {
	successRedirect: '/campgrounds',
	failureRedirect: '/login',
	failureFlash: true,
	successFlash: 'Welcome to Yelpcamp!'
}), function (req, res) {

});

// logout route
router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success', 'Logged you out')
	res.redirect('/campgrounds');
});

// USER PROFILE
router.get('/users/:id', function (req, res) {
	User.findById(req.params.id, function (err, user) {
		if (err) {
			req.flash('error', 'User not found')
			res.redirect('/campgrounds')
		} else {
			Campground.find().where('author.id').equals(user._id).exec(function (err, campgrounds) {
				if (err) {
					req.flash('error', 'Something went wrong')
					res.redirect('back')
				} else {
					res.render('users/show', {
						user,
						campgrounds
					})
				}
			});

		}
	});
});

// EDIT USER
router.get('/users/:id/edit', function (req, res) {
	User.findById(req.params.id, function (err, user) {
		if (err) {
			req.flash('error', err.message)
			return res.redirect('back')
		} else {
			res.render('users/edit', {
				user
			})
		}
	})
});

// UPDATE USER
router.put('/users/:id', function (req, res) {
	User.findByIdAndUpdate(req.params.id, req.body.users, function (err, user) {
		if (err) {
			req.flash('error', err.message)
			return res.redirect('back')
		} else {
			req.flash('success', 'User updated')
			return res.redirect('/users/' + user._id)
		}
	})
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/login')
	}
}

module.exports = router;