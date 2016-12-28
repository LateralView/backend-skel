var nock = require('nock'),
	expect = require('chai').expect,
	factory = require('factory-girl'),
	aws = require('aws-sdk'),
	sinon = require('sinon'),
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

    describe("upload file", function(){
    	it('returns file path if upload success', function (done) {
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

	    it('returns error if file does not exist', function (done) {
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
				path: "./invalid/path/image.png",
				mimetype: "image/png"
			};

			s3Manager.uploadFile(file, "picture/" + validUser._id, function(err, path) {
				nock.cleanAll();
				expect(err).to.exist;
				expect(err.code).to.equal("ENOENT");
			    done();
			});
	    });

	    it('returns error if response is an error', function (done) {
			nock('https://mean-skel.s3.amazonaws.com:443')
			  .put(/.*picture*./)
			  .reply(403, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Error><Code>InvalidAccessKeyId</Code><Message>The AWS Access Key Id you provided does not exist in our records.</Message><AWSAccessKeyId>TEST_KEY</AWSAccessKeyId><RequestId>19F25D5603FE3C5D</RequestId><HostId>SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=</HostId></Error>", { 'x-amz-request-id': '19F25D5603FE3C5D',
			  'x-amz-id-2': 'SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=',
			  'content-type': 'application/xml',
			  'transfer-encoding': 'chunked',
			  date: 'Tue, 02 Feb 2016 19:36:15 GMT',
			  server: 'AmazonS3',
			  connection: 'close' });

			var file = {
				name: "avatar.png",
				path: "./test/fixtures/avatar.png",
				mimetype: "image/png"
			};

			s3Manager.uploadFile(file, "picture/" + validUser._id, function(err, path) {
				nock.cleanAll();
				expect(err).to.exist;
				expect(err.message).to.equal('The AWS Access Key Id you provided does not exist in our records.');
				done();
			});
	    });

    	it('returns error if the request fails', function (done) {
			nock('https://mean-skel.s3.amazonaws.com:443')
			  .put(/.*picture*./)
			  .replyWithError('Some error');

			var file = {
				name: "avatar.png",
				path: "./test/fixtures/avatar.png",
				mimetype: "image/png"
			};

			s3Manager.uploadFile(file, "picture/" + validUser._id, function(err, path) {
				nock.cleanAll();
				expect(err).to.exist;
				done();
			});
	    });
    
        it('returns error if aws sdk throw error', function (done) {
            nock('https://mean-skel.s3.amazonaws.com:443')
                .put(/.*picture*./)
                .replyWithError('Some error');
        
            var file = {
                name: "avatar.png",
                path: "./test/fixtures/avatar.png",
                mimetype: "image/png"
            };
            
            var stub = sinon.stub(aws, 'S3', function () {
				return {
					upload: function () {
						throw new Error('Oops');
                    }
				}
            });
        
            s3Manager.uploadFile(file, "picture/" + validUser._id, function(err, path) {
                nock.cleanAll();
                stub.restore();
                expect(err).to.exist;
                done();
            });
        });
    });

    describe("delete file", function(){
    	it('deletes file successfully', function (done) {
			nock('https://mean-skel.s3.amazonaws.com:443')
			  .delete(/.*picture*./)
			  .reply(204, "", { 'x-amz-id-2': 'zfAvIl4BX0ILfVzehFzEj8hzxhJKQBhWISbU0QoWTuZHUu7R5MtmH+SHK65rgxRiEXfMoRRIsXQ=',
				  'x-amz-request-id': '4681858C4C9D2F51',
				  date: 'Tue, 02 Feb 2016 18:15:39 GMT',
				  server: 'AmazonS3',
				  connection: 'close' });

			s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", function(err) {
				nock.cleanAll();
				expect(err).to.not.exist;
				done();
			});
	    });

	    it('returns error if response is an error', function (done) {
			nock('https://mean-skel.s3.amazonaws.com:443')
			  .delete(/.*picture*./)
			  .reply(403, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Error><Code>InvalidAccessKeyId</Code><Message>The AWS Access Key Id you provided does not exist in our records.</Message><AWSAccessKeyId>TEST_KEY</AWSAccessKeyId><RequestId>19F25D5603FE3C5D</RequestId><HostId>SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=</HostId></Error>", { 'x-amz-request-id': '19F25D5603FE3C5D',
			  'x-amz-id-2': 'SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=',
			  'content-type': 'application/xml',
			  'transfer-encoding': 'chunked',
			  date: 'Tue, 02 Feb 2016 19:36:15 GMT',
			  server: 'AmazonS3',
			  connection: 'close' });

			s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", function(err) {
				nock.cleanAll();
				expect(err).to.exist;
				expect(err.message).to.equal('The AWS Access Key Id you provided does not exist in our records.');
				done();
			});
	    });

	    it('returns error if the request fails', function (done) {
			nock('https://mean-skel.s3.amazonaws.com:443')
			  .delete(/.*picture*./)
			  .replyWithError('Some error');

			s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", function(err) {
				nock.cleanAll();
				expect(err).to.exist;
				done();
			});
	    });
    
        it('returns error if aws sdk throw error', function (done) {
            nock('https://mean-skel.s3.amazonaws.com:443')
                .put(/.*picture*./)
                .replyWithError('Some error');
        
            var file = {
                name: "avatar.png",
                path: "./test/fixtures/avatar.png",
                mimetype: "image/png"
            };
        
            var stub = sinon.stub(aws, 'S3', function () {
                return {
                    deleteObject: function () {
                        throw new Error('Oops');
                    }
                }
            });
        
            s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", function(err, path) {
                nock.cleanAll();
                stub.restore();
                expect(err).to.exist;
                done();
            });
        });

    });


});