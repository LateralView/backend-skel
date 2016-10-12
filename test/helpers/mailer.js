var nock = require('nock'),
	expect = require('chai').expect,
	factory = require('factory-girl'),
	mailer = require('../../app/helpers/mailer');

describe('mailer Helper', function () {
	var validUser = null;

	before(function(done){
		// Create user
    	factory.create("user", function (error, user) {
	        if (!error)
	          validUser = user;
	        else
	          throw error;

	        done();
	    });
    });

	it('returns error if delivery fails', function (done) {
		nock('https://api.sendgrid.com:443')
		.post(/.*send*./)
		.reply(400, {"errors":["The provided authorization grant is invalid, expired, or revoked"],"message":"error"});

		mailer.sendActivationEmail(validUser, function(error){
			nock.cleanAll();
			expect(error).to.exist;
			expect(error.message).to.equal('The provided authorization grant is invalid, expired, or revoked');
		    done();
		});
    });

    it('do not return error if delivery success', function (done) {
		nock('https://api.sendgrid.com:443')
		.post(/.*send*./)
		.reply(200, {"message":"success"});

		mailer.sendActivationEmail(validUser, function(error){
			nock.cleanAll();
			expect(error).to.not.exist;
		    done();
		});
    });

    it('returns error if request fails', function (done) {
		nock('https://api.sendgrid.com:443')
		.post(/.*send*./)
		.replyWithError('Some error');

		mailer.sendActivationEmail(validUser, function(error){
			nock.cleanAll();
			expect(error).to.exist;
		    done();
		});
    });
	
	it('Call catch error for wrong parameter', function(done){
		nock('https://api.sendgrid.com:443')
			.post(/.*send*./)
			.reply(200, {"message": "success"});
		mailer.sendActivationEmail(null, function(error){
			expect(error).to.exist;
			done();
		});
	});
});