var request = require('supertest'),
    factory = require('factory-girl'),
    User = require('../../app/models/user'),
    nock = require('nock'),
    expect = require('chai').expect,
	async = require('async'),
	sinon = require('sinon');

describe('UsersHandler', function () {
	describe('POST /api/users/authenticate', function () {
        var validUser = null;
        var password = "testpassword";
        var server;
        
        before(function(done){
            server = require('../../server');
            
            // Create valid user
            factory.create("user", {password: password}, function (error, user) {
                if (!error)
                    validUser = user;
                else
                    throw error;
                
                done();
            });
        });
        
        
    	it('responds with error if user does not exist', function (done) {
	    	request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: 'notregistered@email.com', password: 'testtest' })
  				.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000100);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(401, done);
	    });
	
		it('responds with error if get error from mongo', function (done) {
			var mockFindOne = {
				findOne: function(){
					return this;
				},
				select: function(){
					return this;
				},
				exec: function(callback){
					callback(new Error('Oops'));
				}
			};
			
			var stub = sinon.stub(User, 'findOne').returns(mockFindOne);
			request(server)
				.post('/api/users/authenticate')
				.send({ email: 'notregistered@email.com', password: 'testtest' })
				.expect('Content-Type', /json/)
                .expect(function(response){
                	stub.restore();
                    nock.cleanAll();
                    expect(response.body.code).to.equal(1000101);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(400, done);
		});

    	it('responds with error if user password is wrong', function (done) {
	    	request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: validUser.email, password: 'invalid' })
  				.expect('Content-Type', /json/)
                .expect(function(response){
                    nock.cleanAll();
                    expect(response.body.code).to.equal(1000100);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(401, done);
	    });

	    it('responds with error if user is not active', function (done) {
	    	request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: validUser.email, password: password })
  				.expect('Content-Type', /json/)
                .expect(function(response){
                    nock.cleanAll();
                    expect(response.body.code).to.equal(1000102);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(401, done);
	    });

	    it('responds with token and user info if login success', function (done) {
	    	// Set active flag as true
            factory.create("user", {password: password, active: true}, function (error, user) {
                expect(error).to.not.exist;
                    request(server)
                        .post('/api/users/authenticate')
                        .send({email: user.email, password: password})
                        .expect('Content-Type', /json/)
                        .expect(function (response) {
                            expect(response.body.token).to.exist;
                            expect(response.body.user).to.exist;
                            expect(response.body.user.email).to.equal(user.email);
                            expect(response.body.user.firstname).to.equal(user.firstname);
                            expect(response.body.user.lastname).to.equal(user.lastname);
                            expect(response.body.user._id).to.equal(String(user._id));
                        })
                        .expect(200, done);
            });
	    });

    });

	describe('POST /api/users', function () {
        var validUser = null;
        var password = "testpassword";
        var server;
        
        before(function(done){
            server = require('../../server');
            
            // Create valid user
            factory.create("user", {password: password}, function (error, user) {
                if (!error)
                    validUser = user;
                else
                    throw error;
                
                done();
            });
        });
        
		
    	it('responds with error if email exist', function (done) {
	    	request(server)
	    		.post('/api/users')
  				.send({ email: validUser.email, password: 'testtest', firstname: 'James', lastname: 'Doe' })
  				.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000001);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.contains('email')
                })
                .expect(409, done);
	    });

	    it('responds with error if some validation fails', function (done) {
	    	request(server)
	    		.post('/api/users')
  				.send({ email: "invalidemail", password: 'testtest', firstname: 'James', lastname: 'Doe' })
  				.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000000);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.contains('email')
                })
                .expect(400, done);
	    });

	    it('responds with success if the user was created', function (done) {
	    	var user = factory.build("user", function(error, user){
	    		request(server)
		    		.post('/api/users')
	  				.send({ email: user.email, password: user.password, firstname: user.firstname, lastname: user.lastname })
	  				.expect('Content-Type', /json/)
                    .expect(function(response){
                        expect(response.body.message).to.exist;
                        expect(response.body.user).to.exist;
                        expect(response.body.user._id).to.exist;
                        expect(response.body.user.email).to.equal(user.email);
                    })
                    .expect(201, done);
	    	});
	    });

    });

	describe('POST /api/users/activate', function () {
		var validUser = null;
        var password = "testpassword";
        var server;
        
        before(function(done){
            server = require('../../server');
            
            // Create valid user
            factory.create("user", {password: password, active: true}, function (error, user) {
                if (!error)
                    validUser = user;
                else
                    throw error;
                
                done();
            });
        });

    	it('responds with error if token does not exist', function (done) {
	    	request(server)
	    		.post('/api/users/activate')
  				.send({ activation_token: 'invalidtoken' })
  				.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000301);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.contains('activation_token')
                })
                .expect(400, done);
	    });
		
		it('responds with error from activateAccount method', function (done) {
			var stub = sinon.stub(User, 'activateAccount').yields({message: 'Oops'});
			request(server)
				.post('/api/users/activate')
				.send({ activation_token: 'invalidtoken' })
				.expect('Content-Type', /json/)
                .expect(function(response){
                	stub.restore();
                    expect(response.body.code).to.equal(1000300);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(400, done);
		});

	    it('responds with success if the user was activated', function (done) {
            factory.create("user", {password: password}, function (err, user) {
    			expect(err).to.not.exist
                request(server)
                    .post('/api/users/activate')
                    .send({activation_token: user.activation_token})
                    .expect('Content-Type', /json/)
                    .expect(200,
                        {
                            message: "Account activated."
                        }, done);
            });
	    });

    });

    describe('PUT /api/user', function () {
    	var access_token;
		var validUser = null;
		var password = "testpassword";
		var server;
		
		before(function(done){
			server = require('../../server');
			
			// Create valid user
			factory.create("user", {password: password, active: true}, function (error, user) {
				if (!error)
					validUser = user;
				else
					throw error;

				// Authenticate user
				request(server)
					.post('/api/users/authenticate')
					.send({ email: validUser.email, password: password })
					.end(function(err, res){
						access_token = res.body.token;
						done();
					});
			});
		});

    	it('responds with status 403 if token is not present', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000401);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(403, done);
	    });

	    it('responds with status 403 if token is invalid', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', 'invalidtoken')
	    		.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000400);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(403, done);
	    });
    
        it('responds with status 403 if token is valid and cant get current user', function (done) {
            var mockFindOne = {
                findOne: function(){
                    return this;
                },
                select: function(){
                    return this;
                },
                exec: function(callback){
                    callback(new Error('Oops'));
                }
            };
        	var stub = sinon.stub(User, 'findOne').returns(mockFindOne);
            request(server)
                .put('/api/user')
                .set('x-access-token', access_token)
                .expect('Content-Type', /json/)
                .expect(function(response){
                	stub.restore();
                    expect(response.body.code).to.equal(1000400);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.be.empty;
                })
                .expect(403, done);
        });

	    it('responds with error if current password is invalid', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send({ password: "invalid", new_password: "newtestpassword" })
	    		.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000201);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.contains('password')
                })
                .expect(400, done);
	    });

	    it('responds with error if some validation fails', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send({ firstname: "  ", lastname: "  " }) // Invalid update
	    		.expect('Content-Type', /json/)
                .expect(function(response){
                    expect(response.body.code).to.equal(1000200);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.contains('firstname');
                    expect(response.body.errors).to.contains('lastname');
                })
                .expect(400, done);
	    });

	    it('responds with error if file is invalid', function (done) {
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

	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send()
	    		.attach('picture', './test/fixtures/invalid-avatar.txt')
	    		.expect('Content-Type', /json/)
                .expect(function(response){
                	nock.cleanAll();
                    expect(response.body.code).to.equal(1000200);
                    expect(response.body.message).to.exist;
                    expect(response.body.detail).to.exist;
                    expect(response.body.errors).to.contains('picture.original_file.mimetype');
                })
                .expect(400, done);
	    });


	    it('responds with success and user info if the user was updated', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send({ firstname: "Derrick", lastname: "Faulkner" })
	    		.expect('Content-Type', /json/)
	    		.expect(function(response){
  					expect(response.body.errors).to.not.exist;
  					expect(response.body.user).to.exist;
  					expect(response.body.user.email).to.equal(validUser.email);
  					expect(response.body.user.firstname).to.equal("Derrick");
  					expect(response.body.user.lastname).to.equal("Faulkner");
  					expect(response.body.user._id).to.equal(String(validUser._id));
  				})
  				.expect(200, done);
	    });
	
		it('responds with success on change password', function (done) {
			async.waterfall([
				function(cb){
					factory.create('user', {password: password}, function(err, user){
						cb(err, user);
					});
				},
				function (user, cb) {
					User.activateAccount(user.activation_token, function(err){
						cb(err, user);
					});
				},
				function(user, cb){
					request(server)
						.post('/api/users/authenticate')
						.send({ email: user.email, password: password })
						.end(function(err, res){
							cb(err, user, res.body.token);
						});
				}
			], function(err, user, token){
				expect(err).to.not.exist;
				expect(token).to.exist;
				request(server)
					.put('/api/user')
					.set('x-access-token', token)
					.send({ password: password, new_password: password+'test' })
					.expect('Content-Type', /json/)
					.expect(function(response){
						expect(response.body.errors).to.not.exist;
						expect(response.body.user).to.exist;
						expect(response.body.user.email).to.equal(user.email);
						expect(response.body.user.firstname).to.equal(user.firstname);
						expect(response.body.user.lastname).to.equal(user.lastname);
						expect(response.body.user._id).to.equal(String(user._id));
						User.findOne({_id: user._id}, function(err, user){
							expect(err).to.not.exist;
							expect(user.comparePassword(password+'test')).to.equal(true)
						});
					})
					.expect(200, done);
			})
			
		});
	
		it('uploads an avatar to user', function (done) {
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

	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.attach('picture', './test/fixtures/avatar.png')
	    		.expect('Content-Type', /json/)
	    		.expect(function(response){
  					expect(response.body.user.picture.url).to.exist;
  					validUser.picture = response.body.user.picture;
  				})
  				.expect(200)
  				.end(function(err, res){
  					nock.cleanAll();
					done();
				});
	    });

	    it('modifies existing avatar', function (done) {
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

	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.attach('picture', './test/fixtures/avatar.png')
	    		.expect('Content-Type', /json/)
	    		.expect(function(response){
  					expect(response.body.user.picture.url).to.exist;
  					expect(response.body.user.picture.url).to.not.equal(validUser.picture.url);
  				})
  				.expect(200)
  				.end(function(err, res){
  					nock.cleanAll();
					done();
				});
	    });
    });

});
