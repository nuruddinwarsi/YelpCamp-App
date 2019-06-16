var express = require('express');
var router = express.Router();

var Campground = require('../models/campground'),
	Comment = require('../models/comment');

var middleware = require('../middleware');

var multer = require('multer');
var storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function (req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
var upload = multer({
	storage: storage,
	fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'Cloudinary cloud name',
	api_key: 'Your Cloudinary api key here',
	api_secret: 'Your Cloudinary secret here',
});

// INDEX - Show all campgrounds
router.get("/", function (req, res) {
	var noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({
			name: regex
		}, function (error, campgroundsDB) {
			if (error) {
				console.log("error");
			} else {
				if (campgroundsDB.length < 1) {
					noMatch = 'No campgrounds match that query. Please try again'
				}
				res.render("campgrounds/index", {
					campgrounds: campgroundsDB,
					page: 'campgrounds',
					noMatch: noMatch
				});
			}
		});
	} else {
		Campground.find({}, function (error, campgroundsDB) {
			if (error) {
				console.log("error");
			} else {
				res.render("campgrounds/index", {
					campgrounds: campgroundsDB,
					page: 'campgrounds',
					noMatch: noMatch
				});
			}
		});
	}
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
	res.render("campgrounds/new");
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
	cloudinary.uploader.upload(req.file.path, function (result) {
		var name = req.body.name;
		var image = result.secure_url;
		var desc = req.body.description;
		var price = req.body.price;
		var author = {
			id: req.user._id,
			username: req.user.username
		};
		var newCampground = {
			name: name,
			image: image,
			description: desc,
			author: author,
			price: price
		};
		Campground.create(newCampground, function (err, campground) {
			if (err) {
				req.flash('error', err.message)
				return res.redirect('back')
			} else {
				req.flash('success', 'Successfully created campground')
				return res.redirect("/campgrounds/" + campground.id);
			}
		});
	});
});

// SHOW - shows more info about a particular campground
router.get("/:id", function (req, res) {
	Campground.findById(req.params.id).populate("comments").exec(function (err, campgroundFound) {
		if (err || !campgroundFound) {
			req.flash('error', 'Campground unavailable')
			res.redirect('back')
		} else {
			res.render("campgrounds/show", {
				campgrounds: campgroundFound
			});
		}
	});
});

// EDIT campground route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			req.flash('error', 'Campground not found')
			res.redirect('/campgrounds')
		} else {
			res.render('campgrounds/edit', {
				campground
			})
		}
	});
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function (req, res) {
	// Find and update
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
		if (err) {
			req.flash('error', 'Campground not found')
			res.redirect('/campgrounds')
		} else {
			req.flash('success', 'Campground Updated')
			// redirect to show page
			res.redirect('/campgrounds/' + req.params.id)
		}
	})
});


// DELETE campgrounds
router.delete('/:id', middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findByIdAndDelete(req.params.id, function (err, campgroundRemoved) {
		if (err) {
			req.flash('error', 'Unable to delete campground')
			res.redirect('/campgrounds')
		} else {
			Comment.deleteMany({
				_id: {
					$in: campgroundRemoved.comments
				}
			}, function (err) {
				if (err) {
					console.log(err)
				}
			});
			req.flash('success', 'Campground Deleted')
			res.redirect('/campgrounds')
		}
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;