const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
const request = require('request');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('users/login', { data: { input: 'cx' } }));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('users/register', { data: { input: 'cx' } }));

//Mail stuff
var nodemailer = require('nodemailer');

// Register
router.post('/register', (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];

	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'Please enter all fields' });
	}

	if (password != password2) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (password.length < 6) {
		errors.push({ msg: 'Password must be at least 6 characters' });
	}

	if (name.length < 3) {
		errors.push({ msg: 'Username must be at least 3 characters' });
	}
	if (name.length > 16) {
		errors.push({ msg: 'Username must be 16 characters at most' });
	}

	if (errors.length > 0) {
		res.render('users/register', {
			errors,
			name,
			email,
			password,
			password2,
			data: {
				input: 'cx'
			}
		});
	} else {
		User.findOne({ email: { $regex: new RegExp(email, 'i') } }).then((user) => {
			if (user) {
				errors.push({ msg: 'That email address is already registered' });
				res.render('users/register', {
					errors,
					name,
					email,
					password,
					password2,
					data: {
						input: 'cx'
					}
				});
			} else {
				User.findOne({ name: { $regex: new RegExp(name, 'i') } }).then((user) => {
					if (user) {
						errors.push({ msg: 'That username is already registered' });
						res.render('users/register', {
							errors,
							name,
							email,
							password,
							password2,
							data: {
								input: 'cx'
							}
						});
					} else {
						const newUser = new User({
							name,
							email,
							password,
							data: {
								input: 'cx'
							}
						});

						if (
							req.body['g-recaptcha-response'] === undefined ||
							req.body['g-recaptcha-response'] === '' ||
							req.body['g-recaptcha-response'] === null
						) {
							let errors = [];
							errors.push({ msg: 'Failed captcha!' });
							return res.render('users/register', {
								errors,
								data: {
									input: 'cx'
								}
							});
						}

						var secretKey = '6LezSs0ZAAAAAJ6floShYqYAf35TAeayIV7N9wDC';
						var verificationUrl =
							'https://www.recaptcha.net/recaptcha/api/siteverify?secret=' +
							secretKey +
							'&response=' +
							req.body['g-recaptcha-response'] +
							'&remoteip=' +
							req.connection.remoteAddress;

						request(verificationUrl, function(error, response, body) {
							body = JSON.parse(body);
							// Success will be true or false depending upon captcha validation.
							if (body.success !== undefined && !body.success) {
								let errors = [];
								errors.push({ msg: 'Failed captcha!' });
								return res.render('users/register', {
									errors,
									data: {
										input: 'cx'
									}
								});
							}
						});

						bcrypt.genSalt(10, (err, salt) => {
							bcrypt.hash(newUser.password, salt, (err, hash) => {
								if (err) throw err;
								newUser.password = hash;
								newUser
									.save()
									.then((user) => {
										req.flash('success_msg', 'You are now registered and can log in');

										// Send mail
										var transOptions = {
											host: 'smtp.eu.mailgun.org',
											port: 587,
											secure: false,
											auth: {
												user: 'postmaster@mail.codebin.run',
												pass: '3bce8b41e34ba484f47027ff13afeda8-d5e69b0b-159a84bf'
											}
										};
										var transporter = nodemailer.createTransport(transOptions);
										var mainOptions = {
											from: 'Codebin Team <info@mail.codebin.run>',
											to: email,
											subject: 'Welcome to Codebin!',
											html: plate.replace('{name}', name)
										};
										var callback = function(err, info) {
											if (err) {
												throw err;
											}
										};
										transporter.sendMail(mainOptions, callback);

										//Redirect
										res.redirect('/users/login', {
											data: {
												input: 'cx'
											}
										});
									})
									.catch((err) => console.log(err));
							});
						});
					}
				});
			}
		});
	}
});

// Login
router.post('/login', (req, res, next) => {
	if (
		req.body['g-recaptcha-response'] === undefined ||
		req.body['g-recaptcha-response'] === '' ||
		req.body['g-recaptcha-response'] === null
	) {
		let errors = [];
		errors.push({ msg: 'Failed captcha!' });
		return res.render('users/login', {
			errors,
			data: {
				input: 'cx'
			}
		});
	}

	var secretKey = '6LezSs0ZAAAAAJ6floShYqYAf35TAeayIV7N9wDC';
	var verificationUrl =
		'https://www.recaptcha.net/recaptcha/api/siteverify?secret=' +
		secretKey +
		'&response=' +
		req.body['g-recaptcha-response'] +
		'&remoteip=' +
		req.connection.remoteAddress;

	request(verificationUrl, function(error, response, body) {
		body = JSON.parse(body);
		// Success will be true or false depending upon captcha validation.
		if (body.success !== undefined && !body.success) {
			let errors = [];
			errors.push({ msg: 'Failed captcha!' });
			return res.render('users/login', {
				errors,
				data: {
					input: 'cx'
				}
			});
		}
		passport.authenticate('local', {
			successRedirect: '/dashboard',
			failureRedirect: '/users/login',
			failureFlash: true
		})(req, res, next);
	});
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login', {
		data: {
			input: 'cx'
		}
	});
});

//Email plate
var plate = `<!DOCTYPE html>
<html style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
<head>
<meta name="viewport" content="width=device-width" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Actionable emails e.g. reset password</title>


<style type="text/css">
img {
max-width: 100%;
}
body {
-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
}
body {
background-color: #f6f6f6;
}
@media only screen and (max-width: 640px) {
  body {
    padding: 0 !important;
  }
  h1 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h2 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h3 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h4 {
    font-weight: 800 !important; margin: 20px 0 5px !important;
  }
  h1 {
    font-size: 22px !important;
  }
  h2 {
    font-size: 18px !important;
  }
  h3 {
    font-size: 16px !important;
  }
  .container {
    padding: 0 !important; width: 100% !important;
  }
  .content {
    padding: 0 !important;
  }
  .content-wrap {
    padding: 10px !important;
  }
  .invoice {
    width: 100% !important;
  }
}
</style>
</head>

<body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">

<table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
    <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
      <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
        <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">
              <h1>Welcome, {name}!</h1>
              <meta itemprop="name" content="Confirm Email" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Codebin is excited to welcome you to our site!
                  </td>
                </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    We welcome you with open arms and hope to see lots of code from you!
                  </td>
                </tr>
                <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Kind regards,
                  </td>
                </tr>
                </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    &mdash; Team Codebin
                  </td>
                </tr>
                <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    <a href="https://codebin.run/users/login" class="btn-primary" itemprop="url" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">Login</a>
                  </td></table></td>
          </tr></table><div class="footer" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">
            </tr></table></div></div>
    </td>
    <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
  </tr></table></body>
</html>`;

module.exports = router;
