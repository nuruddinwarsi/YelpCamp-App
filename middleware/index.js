var middlewareObject = {}

var Campground = require('../models/campground'),
	Comment = require('../models/comment');

middlewareObject.checkCampgroundOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, function (err, campground) {
			// !campground avoids a server crash
			if (err || !campground) {
				req.flash('error', 'Campground not available')
				res.redirect('/campgrounds')
			} else {
				if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash('error', 'You do not have the permission to do that(CG)')
					res.redirect('/campgrounds/' + req.params.id)
				}

			}
		});
	} else {
		req.flash('error', 'You need to be logged in to Edit/Delete Campgrounds')
		res.render('login')
	}
}

middlewareObject.checkCommentOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function (err, comment) {
			if (err || !comment) {
				req.flash('error', 'Comment not found')
				res.redirect('back')
			} else {
				if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
					next()
				} else {
					req.flash('error', 'You do not have the permission to do that(CO)')
					res.redirect('back')
				}
			}
		});
	} else {
		req.flash('error', 'You need to be logged in to Edit/Delete Comments')
		res.render('login')
	}
}

middlewareObject.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error', 'You need to be logged in to do that')
		res.redirect('/login')
	}
}

module.exports = middlewareObject;