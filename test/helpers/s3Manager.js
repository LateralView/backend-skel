var nock = require('nock'),
	expect = require('chai').expect,
	factory = require('factory-girl'),
	s3Manager = require('../../app/helpers/s3Manager');

describe('s3Manager Helper', function () {
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

	it('uploads file and returns file path', function (done) {
		// Mock s3 response
		nock('https://mean-skel.s3.amazonaws.com:443')
				.put(/.*picture*./)
				.reply(200, "", { 'x-amz-id-2': '6pv/eHWz7VrUPAJNr15F3OzFiXIFi/QJU0UArw3pG7/xYSh5LaX+8RQDelmFp61bYuHvWXTJaWs=',
					'x-amz-request-id': '3F74105A9E031597',
					date: 'Tue, 02 Feb 2016 14:14:33 GMT',
					etag: '"21a280f3002ffdf828edd9b56eef380f"',
					'content-length': '0',
					server: 'AmazonS3',
					connection: 'close' });

		var file = {
			name: "avatar.png",
			path: "./test/fixtures/avatar.png",
			mimetype: "image/png"
		};

		s3Manager.uploadFile(file, "picture/" + validUser._id, function(err, path) {
			nock.cleanAll();
			expect(err).to.not.exist;
			expect(path).to.eq("picture/" + validUser._id + "/avatar.png");
		    done();
		});


    });

});