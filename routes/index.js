const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, checkAuth } = require('../config/auth');
const User = require('../models/User');
const JSONHelper = require('../lib/jsonHelper');
const gen = require('../lib/generate');
var path = require('path');
const fs = require('fs');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Creator
router.get('/create', checkAuth, (req, res) =>
	res.render('create', {
		name: req.user.name ? req.user.name : 'Anonymous'
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

	var fileName = new gen().createKey(6);
	JSONHelper.writeFile(__dirname + '/../raw', fileName, JSONObj, res.redirect('/share/' + fileName));
});

module.exports = router;
