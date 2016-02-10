var request = require('supertest'),
    factory = require('factory-girl'),
    User = require('../../app/models/user'),
    nock = require('nock'),
    expect = require('chai').expect;

describe('UsersHandler', function () {
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

    describe('POST /api/users/authenticate', function () {
    	it('responds with error if user does not exist', function (done) {
	    	request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: 'notregistered@email.com', password: 'testtest' })
  				.expect('Content-Type', /json/)
  				.expect(200,
  					{
  						success: false, message: "Login failed",
  						errors: {
  							user:
  								{ message: "Invalid Credentials."  }
  						}
  					}, done);
	    });

    	it('responds with error if user password is wrong', function (done) {
	    	request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: validUser.email, password: 'invalid' })
  				.expect('Content-Type', /json/)
  				.expect(200,
  					{
  						success: false, message: "Login failed",
  						errors: {
  							user:
  								{ message: "Invalid Credentials."  }
  						}
  					}, done);
	    });

	    it('responds with error if user is not active', function (done) {
	    	request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: validUser.email, password: password })
  				.expect('Content-Type', /json/)
  				.expect(200,
  					{
  						success: false, message: "Login failed",
  						errors: {
  							user:
  								{ message: "Please activate your account."  }
  						}
  					}, done);
	    });

	    it('responds with token and user info if login success', function (done) {
	    	// Set active flag as true
	    	validUser.active = true;
	    	validUser.save(function(err, user) {
	    		request(server)
		    		.post('/api/users/authenticate')
	  				.send({ email: validUser.email, password: password })
	  				.expect('Content-Type', /json/)
	  				.expect(function(response){
	  					expect(response.body.success).to.equal(true);
	  					expect(response.body.token).to.exist;
	  					expect(response.body.user).to.exist;
	  					expect(response.body.user.email).to.equal(validUser.email);
	  					expect(response.body.user.firstname).to.equal(validUser.firstname);
	  					expect(response.body.user.lastname).to.equal(validUser.lastname);
	  					expect(response.body.user._id).to.equal(String(validUser._id));
	  				})
	  				.expect(200, done);
	    	});
	    });

    });

	describe('POST /api/users', function () {
    	it('responds with error if email exist', function (done) {
	    	request(server)
	    		.post('/api/users')
  				.send({ email: validUser.email, password: 'testtest', firstname: 'James', lastname: 'Doe' })
  				.expect('Content-Type', /json/)
  				.expect(200,
  					{
  						success: false, message: "User validation failed",
  						errors: {
  							email:
  								{ message: "A user with that email already exists."  }
  						}
  					}, done);
	    });

	    it('responds with error if some validation fails', function (done) {
	    	request(server)
	    		.post('/api/users')
  				.send({ email: "invalidemail", password: 'testtest', firstname: 'James', lastname: 'Doe' })
  				.expect('Content-Type', /json/)
  				.expect(function(response){
  					expect(response.body.success).to.not.exist;
  					expect(response.body.errors).to.exist;
  				})
  				.expect(200, done);
	    });

	    it('responds with success if the user was created', function (done) {
	    	var user = factory.build("user", function(error, user){
	    		request(server)
		    		.post('/api/users')
	  				.send({ email: user.email, password: user.password, firstname: user.firstname, lastname: user.lastname })
	  				.expect('Content-Type', /json/)
	  				.expect(200,
	  					{
	      					success: true,
	      					message: "User created!"
	    				}, done);
	    	});
	    });

    });

	describe('POST /api/users/activate', function () {
		before(function(done){
			// Set active flag as false
			validUser.active = false;
	    	validUser.save(function(err, user) {
	    		done();
	    	});
	    });

    	it('responds with error if token does not exist', function (done) {
	    	request(server)
	    		.post('/api/users/activate')
  				.send({ activation_token: 'invalidtoken' })
  				.expect('Content-Type', /json/)
  				.expect(200,
  					{
						success: false,
						errors: {
							user: {
								message: "Invalid token."
							}
						}
					}, done);
	    });

	    it('responds with success if the user was activated', function (done) {
	    	request(server)
	    		.post('/api/users/activate')
  				.send({ activation_token: validUser.activation_token })
  				.expect('Content-Type', /json/)
  				.expect(200,
					{
						success: true,
						message: "Account activated."
					}, done);
	    });

    });

    describe('PUT /api/user', function () {
    	var access_token;
		before(function(done){
			// Authenticate user
			request(server)
	    		.post('/api/users/authenticate')
  				.send({ email: validUser.email, password: password })
  				.end(function(err, res){
					access_token = res.body.token;
					done();
				});
	    });

    	it('responds with status 403 if token is not present', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.expect('Content-Type', /json/)
  				.expect(403, {
					success: false,
					message: "No token provided."
				}, done);
	    });

	    it('responds with status 403 if token is invalid', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', 'invalidtoken')
	    		.expect('Content-Type', /json/)
  				.expect(403, {
					success: false,
					message: "Failed to authenticate token."
				}, done);
	    });

	    it('responds with error if current password is invalid', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send({ password: "invalid", new_password: "newtestpassword" })
	    		.expect('Content-Type', /json/)
  				.expect(200, {
					success: false,
					message: "User validation failed",
					errors: {
						password: {
							message: "Current password is invalid." }
						}
					}, done);
	    });

	    it('responds with error if some validation fails', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send({ firstname: "  " }) // Invalid update
	    		.expect('Content-Type', /json/)
	    		.expect(function(response){
  					expect(response.body.success).to.not.exist;
  					expect(response.body.errors).to.exist;
  				})
  				.expect(200, done);
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
	    		.send({ firstname: "Derrick", lastname: "Faulkner" })
	    		.attach('picture', './test/fixtures/invalid-avatar.txt')
	    		.expect('Content-Type', /json/)
	    		.expect(function(response){
  					expect(response.body.success).to.not.exist;
  					expect(response.body.errors).to.exist;
  				})
  				.expect(200)
  				.end(function(err, res){
  					nock.cleanAll();
					done();
				});;
	    });


	    it('responds with success and user info if the user was updated', function (done) {
	    	request(server)
	    		.put('/api/user')
	    		.set('x-access-token', access_token)
	    		.send({ firstname: "Derrick", lastname: "Faulkner" })
	    		.expect('Content-Type', /json/)
	    		.expect(function(response){
  					expect(response.body.success).to.equal(true);
  					expect(response.body.errors).to.not.exist;
  					expect(response.body.user).to.exist;
  					expect(response.body.user.email).to.equal(validUser.email);
  					expect(response.body.user.firstname).to.equal("Derrick");
  					expect(response.body.user.lastname).to.equal("Faulkner");
  					expect(response.body.user._id).to.equal(String(validUser._id));
  				})
  				.expect(200, done);
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
  					expect(response.body.success).to.equal(true);
  					expect(response.body.user.picture.url).to.exist;
  					validUser.picture = response.body.user.picture;
  				})
  				.expect(200)
  				.end(function(err, res){
  					nock.cleanAll();
					done();
				});;
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
  					expect(response.body.success).to.equal(true);
  					expect(response.body.user.picture.url).to.exist;
  					expect(response.body.user.picture.url).to.not.equal(validUser.picture.url);
  				})
  				.expect(200)
  				.end(function(err, res){
  					nock.cleanAll();
					done();
				});;
	    });
    });

});