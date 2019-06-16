var express = require('express');
var router = express.Router({
	mergeParams: true // to find params from parent router
});

var Campground = require('../models/campground'),
	Comment = require('../models/comment');

var middleware = require('../middleware');

// Comments NEW route
router.get("/new", middleware.isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			req.flash('error', 'Cant find the campground')
			res.redirect('back')
		} else {
			res.render("comments/new", {
				campground: campground
			});
		}
	});
});

// Comments CREATE route
router.post("/", middleware.isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, campgroundFound) {
		if (err) {
			req.flash('error', 'Campground not found')
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function (err, comment) {
				if (err) {
					req.flash('error', 'Failed to add comment')
					res.redirect('/campgrounds/' + req.params.id)
				} else {
					// Add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// Save Comment
					comment.save();

					campgroundFound.comments.push(comment);
					campgroundFound.save()

					req.flash('success', 'New comment added')
					res.redirect("/campgrounds/" + campgroundFound._id);
				}
			})
		}
	});
});

// EDIT
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if (err || !campground) {
			req.flash('error', 'Campground not found')
			return res.redirect('back')
		}
		Comment.findById(req.params.comment_id, function (err, foundComment) {
			if (err) {
				req.flash('error', 'Comment unavailble')
				res.redirect('back')
			} else {
				res.render('comments/edit', {
					campground_id: req.params.id,
					comment: foundComment
				})
			}
		});
	});
});

// UPDATE
router.put('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
		if (err) {
			req.flash('error', 'Cannot update the Comment')
			res.redirect('back')
		} else {
			req.flash('success', 'Comment updated')
			res.redirect('/campgrounds/' + req.params.id)
		}
	})
});

// DELETE
router.delete('/:comment_id', middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndDelete(req.params.comment_id, function (err, commentRemoved) {
		if (err) {
			req.flash('error', 'Cannot delete the comment')
			res.redirect('back')
		} else {
			req.flash('success', 'Comment deleted')
			res.redirect('/campgrounds/' + req.params.id);
		}
	})
});

module.exports = router;