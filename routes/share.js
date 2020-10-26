const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const JSONHelper = require('../lib/jsonHelper');
const gen = require('../lib/generate');
var path = require('path');
const { fstat } = require('fs');
const jsonHelper = require('../lib/jsonHelper');

const version = JSONHelper.readFile(__dirname + '/..', 'package').version;
const location = JSONHelper.readFile(__dirname + '/..', 'package').location;

// Welcome Page

router.get('/:id/auth', (req, res) => {
	res.redirect('/share' + req.path.slice(0,-5));
});

router.post('/:id/auth', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	const { password } = req.body;

	if(!password) {
		res.redirect('/share' + req.path.slice(0,-5));
	} else {
		var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
		if(data.password !== password) {
			res.redirect('/share' + req.path.slice(0,-5) + '#error');
		}
		else {

			let private = data.private ? data.private : false;
			let user = req.user ? req.user : { name: 'Anonymous', admin: false };

			if (private) {
				if (!user.admin && user.name !== data.name) {
					return res.status(410).render('404/401', {
						data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
					});
				}
			}

			var username = '';
			if (req.user === undefined) {
				username = 'Anonymous';
			} else {
				username = req.user.name;
			}

			var path = req.path;

			if(path.endsWith('/auth')) {
				path = req.path.slice(0,-5);
			}

			res.render('share', {
				data: data,
				name: username,
				path: path
			});
		}
	}
});

router.get('/:id/raw/auth', (req, res) => {
	res.redirect('/share' + req.path.slice(0,-5));
});

router.post('/:id/raw/auth', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	const { password } = req.body;

	if(!password) {
		res.redirect('/share' + req.path.slice(0,-5));
	} else {
		var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
		if(data.password !== password) {
			res.redirect('/share' + req.path.slice(0,-5) + '#error');
		}
		else {

			let private = data.private ? data.private : false;
			let user = req.user ? req.user : { name: 'Anonymous', admin: false };

			if (private) {
				if (!user.admin && user.name !== data.name) {
					return res.status(410).render('404/401', {
						data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
					});
				}
			}

			var username = '';
			if (req.user === undefined) {
				username = 'Anonymous';
			} else {
				username = req.user.name;
			}

			var path = req.path;

			if(path.endsWith('/auth')) {
				path = req.path.slice(0,-5);
			}

			res.render('raw', {
				data: data,
				name: username,
				path: path
			});
		}
	}
});

router.get('/:id', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
	data.id = req.params.id;

	var views = data.views ? data.views : 0;
	data.views = views + 1;

	let private = data.private ? data.private : false;
	let user = req.user ? req.user : { name: 'Anonymous', admin: false };

	if (private) {
		if (!user.admin && user.name !== data.name) {
			return res.status(410).render('404/401', {
				data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
			});
		}
	}

	var username = '';
	if (req.user === undefined) {
		username = 'Anonymous';
	} else {
		username = req.user.name;
	}

	var password = data.password ? data.password : null;
	var auth = req.auth ? req.auth : null;

	var path = req.path;

	if(path.endsWith('/auth')) {
		path = req.path.slice(0,-5);
	}

	if(password == null) {
		res.render('share', {
			data: data,
			name: username,
			path: path
		});
	} else if(password != null && auth == null && username !== data.name) {
		res.render('auth', {
			data: data,
			name: username,
			path: path
		});
	} else {
		res.render('share', {
			data: data,
			name: username,
			path: path
		});
	}
	
	JSONHelper.writeFile(__dirname + '/../raw', data.id, data);

});
router.get('/:id/raw', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
	data.id = req.params.id;

	let private = data.private ? data.private : false;
	let user = req.user ? req.user : { name: 'Anonymous', admin: false };

	if (private) {
		if (!user.admin && user.name !== data.name) {
			return res.status(410).render('404/401', {
				data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
			});
		}
	}

	if (req.user === undefined) {
		username = 'Anonymous';
	} else {
		username = req.user.name;
	}

	var password = data.password ? data.password : null;
	var auth = req.auth ? req.auth : null;

	var path = req.path;

	if(path.endsWith('/auth')) {
		path = req.path.slice(0,-5);
	}

	if(password == null) {
		res.render('share', {
			data: data,
			name: username,
			path: path
		});
	} else if(password != null && auth == null && username !== data.name) {
		res.render('auth', {
			data: data,
			name: username,
			path: path
		});
	} else {
		res.render('share', {
			data: data,
			name: username,
			path: path
		});
	}
});

router.get('/:id/edit', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
	data.id = req.params.id;

	let user = req.user ? req.user : { name: 'Anonymous', admin: false };

	if(user.name === 'Anonymous') {
		return res.status(406).render('404/406', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	if (!user.admin && user.name !== data.name) {
		return res.status(401).render('404/401_1', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	if (req.user === undefined) {
		username = 'Anonymous';
	} else {
		username = req.user.name;
	}

	var path = req.path;

	if(path.endsWith('/auth')) {
		path = req.path.slice(0,-5);
	}

	res.render('edit', {
		data: data,
		name: username,
		path: path
	});
});

router.post('/:id/edit/updatePassword', (req, res) => {
	if (!JSONHelper.exists(__dirname + '/../raw', req.params.id)) {
		return res.status(410).render('404/bin', {
			data: { input: 'cx', version: version, location: location, dateNow: Date.now() }
		});
	}

	var data = JSONHelper.readFile(__dirname + '/../raw', req.params.id);
	data.id = req.params.id;

	var password = req.body.password;
	
	if(!password) {
		data.password = null;
	} else {
		data.password = password;
	}

	JSONHelper.writeFile(__dirname + '/../raw', data.id, data);
});

router.get('/', (req, res) => {
	res.redirect('/create');
});

module.exports = router;
