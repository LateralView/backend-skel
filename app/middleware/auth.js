var jwt = require("jsonwebtoken"),
	config = require("../../config").config(),
	errors = require("../helpers/errors"),
	User = require("../models/user");

var secret_token = config.secret;

// middleware to authenticate routes
module.exports = function(req, res, next) {
	var token = req.headers["x-access-token"];
	if (token) {
		jwt.verify(token, secret_token, function(err, decoded){
			if (err) {
				return res.status(403).send(errors.newError(errors.errorsEnum.AuthToken, err));
			} else {
				// Get user
				User.findOne({ _id: decoded._id, email: decoded.email, active: true })
					.select("+password")
					.exec(function(err, user) {
					if (err || !user) {
						return res.status(403).send(errors.newError(errors.errorsEnum.AuthToken, err ? err : {}));
					} else {
						req.current_user = user;
						next();
					}
				});
			}
		})
	} else {
		return res.status(403).send(errors.newError(errors.errorsEnum.NoTokenProvided));
	}
};
