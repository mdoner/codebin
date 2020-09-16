const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');

//Admin panel
router.get('/', ensureAdmin, (req, res) => {
	res.render('admin/index', {
		user: req.user
	});
});

//Users
router.get('/users', ensureAdmin, (req, res) => {
	User.find({}, function(err, docs) {
		if (err) console.log(err);

		res.render('admin/users', {
			user: req.user,
			docs: docs
		});
	});
});

module.exports = router;
