var mongoose = require('mongoose'),
	passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: {
		type: String,
		default: 'http://mindandculture.org/wordpress6/wp-content/uploads/2018/07/Fotolia_188161178_XS-1.jpg'
	},
	firstName: String,
	lastName: String,
	email: String,
	isAdmin: {
		type: Boolean,
		default: false
	}
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', userSchema);
module.exports = User;