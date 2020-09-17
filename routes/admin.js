const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const fs = require('fs');
const JSONHelper = require('../lib/jsonHelper');
const { uuid } = require('uuidv4');

//Admin panel
router.get('/', ensureAdmin, (req, res) => {
	res.render('admin/admin', {
		user: req.user,
		data: { input: 'cx' }
	});
});

//Users
router.get('/users', ensureAdmin, (req, res) => {
	User.find({}, function(err, docs) {
		if (err) console.log(err);

		res.render('admin/users', {
			user: req.user,
			docs: docs,
			data: { input: 'cx' }
		});
	});
});

//Bins
router.get('/bins', ensureAdmin, (req, res) => {
	try {
		const arrayOfFiles = fs.readdirSync(__dirname + '/../raw');
		var docs = [];
		var i = 0;

		arrayOfFiles.forEach((file) => {
			var read = JSONHelper.readFile(__dirname + '/../raw', file.toString().slice(0, -5));

			read.firstline = read.input[0];
			if (read.firstline.length > 15) read.firstline = read.firstline.toString().substr(0, 15);
			read.input = '';
			read.date = new Date(read.date).toISOString().replace(/T/, ' ').replace(/\..+/, '');
			read.bin = file.toString().slice(0, -5);
			docs[i] = read;
			i++;
		});

		const resp = docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		res.render('admin/bins', {
			user: req.user,
			docs: resp,
			data: {
				input: 'cx'
			}
		});
	} catch (e) {
		console.log(e);
	}
});

module.exports = router;
