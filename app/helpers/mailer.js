var config = require('../../config').config();
var sendgrid = require('sendgrid')(config.sendgrid.API_KEY);

function sendActivationEmail(user, done) {
	try {
		var link = config.base_url + "/activate/" + user.activation_token;

		var email     = new sendgrid.Email({
			to:       user.email,
			from:     'no-reply@meanskel.com',
			fromname: 'MEAN skel',
			subject:  'Please activate your account!',
			html:     "<p>Welcome! " + user.email + "</p><p>Please follow this link to activate your account</p><p><a href='" + link + "'>" + link + "</a></p>"
		});

		sendgrid.send(email, function(err, json) {
			if (err)
				done(err);
			else
				done(null);
		});
	}
	catch(err) {
	    done(err);
	}
}

exports.sendActivationEmail = sendActivationEmail;

