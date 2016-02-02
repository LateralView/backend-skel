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
		nock('https://mandrillapp.com:443')
		.post(/.*send*./)
		.reply(500, {"status":"error","code":-1,"name":"Invalid_Key","message":"Invalid API key"});

		mailer.sendActivationEmail(validUser, function(error){
			nock.cleanAll();
			expect(error).to.exist;
			expect(error.message).to.equal('Invalid API key');
		    done();
		});
    });

    it('do not return error if delivery success', function (done) {
		nock('https://mandrillapp.com:443')
		.post(/.*send*./)
		.reply(200, [{"email":"test@test.com","status":"sent","_id":"7d3c08b5b3f742d7b0d52037ea39ec11","reject_reason":null}]);

		mailer.sendActivationEmail(validUser, function(error){
			nock.cleanAll();
			expect(error).to.not.exist;
		    done();
		});
    });

    it('returns error if request fails', function (done) {
		nock('https://mandrillapp.com:443')
		.post(/.*send*./)
		.replyWithError('Some error');

		mailer.sendActivationEmail(validUser, function(error){
			nock.cleanAll();
			expect(error).to.exist;
		    done();
		});
    });
});