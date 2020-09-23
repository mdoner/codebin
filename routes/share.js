const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const JSONHelper = require('../lib/jsonHelper');
const gen = require('../lib/generate');
var path = require('path');
const { fstat } = require('fs');

const version = JSONHelper.readFile(__dirname + '/..', 'package').version;
const location = JSONHelper.readFile(__dirname + '/..', 'package').location;

// Welcome Page

router.get('/:id.raw', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id.replace(/.raw/gi, ''));
	data.id = req.params.id;

	if (req.user === undefined) {
		username = 'Anonymous';
	} else {
		username = req.user.name;
	}
	res.render('raw', {
		data: data,
		name: username
	});
});

router.get('/:id', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
	data.id = req.params.id;

	var username = '';
	if (req.user === undefined) {
		username = 'Anonymous';
	} else {
		username = req.user.name;
	}
	res.render('share', {
		data: data,
		name: username
	});
});
router.get('/:id/raw', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
	data.id = req.params.id;

	if (req.user === undefined) {
		username = 'Anonymous';
	} else {
		username = req.user.name;
	}
	res.render('raw', {
		data: data,
		name: username
	});
});

router.get('/', (req, res) => {
	res.redirect('/create');
});

module.exports = router;
