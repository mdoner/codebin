const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, checkAuth } = require('../config/auth');
const User = require('../models/User');
const JSONHelper = require('../lib/jsonHelper');
const gen = require('../lib/generate');
var path = require('path');
const fs = require('fs');

// Dashboard
router.get('/', ensureAuthenticated, (req, res) => {
	res.render('dashboard/dashboard', {
		user: req.user,
		data: { input: 'cx' }
	});
});

// Dashboard -> myBins
router.get('/myBins', ensureAuthenticated, (req, res) => {
	try {
		const arrayOfFiles = fs.readdirSync(__dirname + '/../raw');
		var docs = [];
		var i = 0;

		arrayOfFiles.forEach((file) => {
			var read = JSONHelper.readFile(__dirname + '/../raw', file.toString().slice(0, -5));
			if (read.name != req.user.name) return;
			read.firstline = read.input[0];
			if (read.firstline.length > 15) read.firstline = read.firstline.toString().substr(0, 15);
			read.input = '';
			read.date = new Date(read.date).toISOString().replace(/T/, ' ').replace(/\..+/, '');
			read.bin = file.toString().slice(0, -5);
			read.private = read.private ? read.private : 'false';
			read.views = read.views ? read.views : '0';
			docs[i] = read;
			i++;
		});

		const resp = docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		res.render('dashboard/myBins', {
			user: req.user,
			docs: docs,
			data: { input: 'cx' }
		});
	} catch (e) {
		console.log(e);
	}
});

// Creator
router.get('/create', checkAuth, (req, res) =>
	res.render('create', {
		name: req.user.name ? req.user.name : 'Anonymous',
		data: { input: 'cx' }
	})
);

router.post('/create', (req, res) => {
	var { input, name } = req.body;
	let errors = [];

	if (!name || !input) {
		errors.push({ msg: 'Please enter all fields' });
	}
	var JSONObj = {};
	JSONObj.name = name;
	JSONObj.input = input.split('\r\n');
	JSONObj.date = new Date();
	JSONObj.views = 0;

	var fileName = new gen().createKey(6);
	JSONHelper.writeFile(__dirname + '/../raw', fileName, JSONObj, res.redirect('/share/' + fileName));
});

module.exports = router;
