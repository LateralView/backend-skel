var config = require('../../config').config();
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.API_KEY);

function activationEmail(user) {
	try {
		var link = config.base_url + "/activate/" + user.activation_token;
		console.log("ACTIVATION LINK: " + link); // TODO: remove this line
    	var message = {
		    "html": "<p>Welcome! " + user.email + "</p><p>Please follow this link to activate your account</p><p><a href='" + link + "'>" + link + "</a></p>",
		    "subject": "Please activate your account!",
		    "from_email": "no-reply@meanskel.com",
		    "from_name": "MEAN skel",
		    "to": [{
		            "email": user.email,
		            "type": "to"
		        }]
		};

		mandrill_client.messages.send({"message": message}, function(result) {
		    console.log(result);
		}, function(e) {
		    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		});
	}
	catch(err) {
	    console.log(err);
	}
};

exports.activationEmail = activationEmail;

