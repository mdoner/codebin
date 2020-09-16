module.exports = {
	ensureAuthenticated: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash('error_msg', 'Please log in to view that resource.');
		res.redirect('/users/login');
	},
	ensureAdmin: function(req, res, next) {
		if (req.isAuthenticated()) {
			if (req.user.admin) {
				return next();
			}
		}
		req.flash('error_msg', 'Please log in to view that resource.');
		res.redirect('/users/login');
	},
	checkAuth: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			req.user = {};
			req.user.name = 'Anonymous';
			return next();
		}
	},
	forwardAuthenticated: function(req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		}
		res.redirect('/dashboard');
	}
};
