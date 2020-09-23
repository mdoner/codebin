const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAdmin } = require('../config/auth');
const User = require('../models/User');
const JSONHelper = require('../lib/jsonHelper');
const gen = require('../lib/generate');
var path = require('path');
const { fstat } = require('fs');

const version = JSONHelper.readFile(__dirname + '/..', 'package').version;
const location = JSONHelper.readFile(__dirname + '/..', 'package').location.split('-');

const apiKeys = [
	{
		key: 'a1',
		authLevel: 1
	},
	{
		key: 'a2',
		authLevel: 2
	},
	{
		key: 'a3',
		authLevel: 3
	},
	{
		key: 'a4',
		authLevel: 4
	}
];

router.get('/', (req, res) => {
	res.json({
		serverinformation: {
			version: version,
			location: `${location[0]}-${location[1]}-${location[2]}`,
			server: {
				location: location[0],
				stage: location[1],
				id: location[2]
			}
		},
		endpoints: {
			users: {
				needKey: true,
				authLevel: 4,
				endpoint: '/api/users',
				arguments: {
					key: {
						required: true,
						value: 'String'
					},
					includeDate: {
						required: false,
						default: 'true',
						value: 'Boolean'
					},
					includeEmail: {
						required: false,
						default: 'true',
						value: 'Boolean'
					},
					includeAdmin: {
						required: false,
						default: 'true',
						value: 'Boolean'
					},
					includeBeta: {
						required: false,
						default: 'true',
						value: 'Boolean'
					}
				}
			},
			bins: {
				needKey: true,
				authLevel: 2,
				endpoint: 'api/bins',
				arguments: {
					key: {
						required: true,
						value: 'String'
					},
					includeDate: {
						required: false,
						default: 'true',
						value: 'Boolean'
					}
				}
			},
			binsByUser: {
				needKey: true,
				authLevel: 2,
				endpoint: 'api/bins/user/:user',
				arguments: {
					key: {
						required: true,
						value: 'String'
					},
					includeDate: {
						required: false,
						default: 'true',
						value: 'Boolean'
					}
				}
			},
			bin: {
				needKey: true,
				authLevel: 0,
				endpoint: 'api/bins/:id',
				arguments: {
					key: {
						required: false,
						value: 'String'
					},
					includeDate: {
						required: false,
						default: 'true',
						value: 'Boolean'
					}
				}
			}
		}
	});
});

router.get('/users', (req, res) => {
	if (!req.query.key) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Please provide an API Key.'
		});
	}
	if (!checkAPIKey(req.query.key)) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Invalid API Key.'
		});
	}
	if (!checkAuthLevel(req.query.key, 4)) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Not high enough AuthLevel.'
		});
	}

	var JSONObj = { success: true, statusCode: 200 };

	var users = [];
});

router.get('/bins', (req, res) => {
	if (!req.query.key) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Please provide an API Key.'
		});
	}
	if (!checkAPIKey(req.query.key)) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Invalid API Key.'
		});
	}
	if (!checkAuthLevel(req.query.key, 2)) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Not high enough AuthLevel.'
		});
	}

	var JSONObj = { success: true, statusCode: 200 };

	res.status(200).json(JSONObj);
});

router.get('/bins/user/:user', (req, res) => {
	if (!req.query.key) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Please provide an API Key.'
		});
	}
	if (!checkAPIKey(req.query.key)) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Invalid API Key.'
		});
	}
	if (!checkAuthLevel(req.query.key, 2)) {
		return res.status(401).json({
			success: false,
			statusCode: 401,
			statusError: 'Not high enough AuthLevel.'
		});
	}

	var JSONObj = { success: true, statusCode: 200 };

	res.status(200).json(JSONObj);
});

router.get('/bins/:id', (req, res) => {
	var JSONObj = { success: true, statusCode: 200 };

	res.status(200).json(JSONObj);
});

function checkAPIKey(key) {
	var a = false;
	apiKeys.forEach(function(k) {
		if (k.key === key) {
			a = true;
		}
	});

	return a;
}

function checkAuthLevel(key, authLevel) {
	var a = false;
	apiKeys.forEach(function(k) {
		if (k.key === key) {
			a = k.authLevel >= authLevel;
		}
	});
	return a;
}

module.exports = router;
