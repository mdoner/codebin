const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, checkAuth } = require('../config/auth');
const User = require('../models/User');
const JSONHelper = require('../lib/jsonHelper');
const gen = require('../lib/generate');
var path = require('path');
const fs = require('fs');
const request = require('request');

//Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome', { data: { input: 'cx' } }));

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

	if (input.toString().replace(/(?:\r\n|\r|\n)/g, '').replace(/ /g, '').length < 1) {
		return res.render('users/login', {
			errors,
			data: { input: 'cx' }
		});
	}

	if (!name || !input) {
		errors.push({ msg: 'Please enter all fields' });
	}
	var JSONObj = {};
	JSONObj.name = name;
	JSONObj.input = input.split('\r\n');
	JSONObj.date = new Date();

	var fileName = new gen().createKey(6);

	//Captcha
	if (
		req.body['g-recaptcha-response'] === undefined ||
		req.body['g-recaptcha-response'] === '' ||
		req.body['g-recaptcha-response'] === null
	) {
		errors.push({ msg: 'Failed captcha!' });
		return res.render('users/login', {
			errors,
			data: { input: 'cx' }
		});
	}

	var secretKey = '6LfMTc0ZAAAAAJ2VFfUCbvJhsRotXu04HCykJbTM';
	var verificationUrl =
		'https://www.recaptcha.net/recaptcha/api/siteverify?secret=' +
		secretKey +
		'&response=' +
		req.body['g-recaptcha-response'] +
		'&remoteip=' +
		req.connection.remoteAddress;

	request(verificationUrl, function(error, response, body) {
		body = JSON.parse(body);
		if (body.success !== undefined && !body.success) {
			errors.push({ msg: 'Failed captcha!' });
			return res.render('users/login', {
				errors,
				data: { input: 'cx' }
			});
		}
		JSONHelper.writeFile(__dirname + '/../raw', fileName, JSONObj, res.redirect('/share/' + fileName));
	});
});

module.exports = router;
