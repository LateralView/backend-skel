const request = require('supertest');
const factory = require('factory-girl');
const User = require('../../app/models/user');
const nock = require('nock');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('UsersHandler', () => {
  describe('POST /api/users/authenticate', () => {
    let validUser = null;
    let password = "testpassword";
    let server;

    before((done) => {
      server = require('../../server');

      // Create valid user
      factory.create("user", {
        password: password
      }, (error, user) => {
        if (!error)
          validUser = user;
        else
          throw error;

        done();
      });
    });


    it('responds with error if user does not exist', (done) => {
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: 'notregistered@email.com',
          password: 'testtest'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000100);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with error if get error from mongo', (done) => {
      let mockFindOne = {
        findOne: function() {
          return this;
        },
        select: function() {
          return this;
        },
        exec: (callback) => {
          callback(new Error('Oops'));
        }
      };

      let stub = sinon.stub(User, 'findOne').returns(mockFindOne);
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: 'notregistered@email.com',
          password: 'testtest'
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          stub.restore();
          nock.cleanAll();
          expect(response.body.code).to.equal(1000101);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with error if user password is wrong', (done) => {
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: validUser.email,
          password: 'invalid'
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, response) => {
          nock.cleanAll();
          expect(response.body.code).to.equal(1000100);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with error if user is not active', (done) => {
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: validUser.email,
          password: password
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, response) => {
          nock.cleanAll();
          expect(response.body.code).to.equal(1000102);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with token and user info if login success', (done) => {
      // Set active flag as true
      factory.create("user", {
        password: password,
        active: true
      }, (error, user) => {
        expect(error).to.not.exist;
        request(server)
          .post('/api/users/authenticate')
          .send({
            email: user.email,
            password: password
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, response) => {
            expect(response.body.token).to.exist;
            expect(response.body.user).to.exist;
            expect(response.body.user.email).to.equal(user.email);
            expect(response.body.user.firstname).to.equal(user.firstname);
            expect(response.body.user.lastname).to.equal(user.lastname);
            expect(response.body.user._id).to.equal(String(user._id));
            done();
          })
      });
    });

  });

  describe('POST /api/users', () => {
    let validUser = null;
    let password = "testpassword";
    let server;

    before((done) => {
      server = require('../../server');

      // Create valid user
      factory.create("user", {
        password: password
      }, (error, user) => {
        if (!error)
          validUser = user;
        else
          throw error;

        done();
      });
    });


    it('responds with error if email exist', (done) => {
      request(server)
        .post('/api/users')
        .send({
          email: validUser.email,
          password: 'testtest',
          firstname: 'James',
          lastname: 'Doe'
        })
        .expect('Content-Type', /json/)
        .expect(409)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000001);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.contains('email');
          done();
        })
    });

    it('responds with error if some validation fails', (done) => {
      request(server)
        .post('/api/users')
        .send({
          email: "invalidemail",
          password: 'testtest',
          firstname: 'James',
          lastname: 'Doe'
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000000);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.contains('email');
          done();
        })
    });

    it('responds with success if the user was created', (done) => {
      factory.build("user", (error, user) => {
        request(server)
          .post('/api/users')
          .send({
            email: user.email,
            password: user.password,
            firstname: user.firstname,
            lastname: user.lastname
          })
          .expect('Content-Type', /json/)
          .expect(201)
          .end((err, response) => {
            expect(response.body.message).to.exist;
            expect(response.body.user).to.exist;
            expect(response.body.user._id).to.exist;
            expect(response.body.user.email).to.equal(user.email);
            done();
          })
      });
    });

  });

  describe('POST /api/users/activate', () => {
    let password = "testpassword";
    let server;

    before((done) => {
      server = require('../../server');

      // Create valid user
      factory.create("user", {
        password: password,
        active: true
      }, error => {
        if (error) {
          throw error
        }
        done()
      });
    });

    it('responds with error if token does not exist', (done) => {
      request(server)
        .post('/api/users/activate')
        .send({
          activation_token: 'invalidtoken'
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000301);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.contains('activation_token');
          done();
        })
    });

    it('responds with error from activateAccount method', (done) => {
      let stub = sinon.stub(User, 'activateAccount').yields({
        message: 'Oops'
      });
      request(server)
        .post('/api/users/activate')
        .send({
          activation_token: 'invalidtoken'
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          stub.restore();
          expect(response.body.code).to.equal(1000300);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with success if the user was activated', (done) => {
      factory.create("user", {
        password: password
      }, (err, user) => {
        expect(err).to.not.exist
        request(server)
          .post('/api/users/activate')
          .send({
            activation_token: user.activation_token
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, response) => {
            expect(response.body.message).to.exist;
            expect(response.body.message).to.equal("Account activated.");
            done();
          });
      });
    });

  });

  describe('PUT /api/user', () => {
    let access_token;
    let validUser = null;
    let password = "testpassword";
    let server;

    before((done) => {
      server = require('../../server');

      // Create valid user
      factory.create("user", {
        password: password,
        active: true
      }, (error, user) => {
        if (!error)
          validUser = user;
        else
          throw error;

        // Authenticate user
        request(server)
          .post('/api/users/authenticate')
          .send({
            email: validUser.email,
            password: password
          })
          .end((err, res) => {
            access_token = res.body.token;
            done();
          });
      });
    });

    it('responds with status 403 if token is not present', (done) => {
      request(server)
        .put('/api/user')
        .expect('Content-Type', /json/)
        .expect(403)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000401);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with status 403 if token is invalid', (done) => {
      request(server)
        .put('/api/user')
        .set('x-access-token', 'invalidtoken')
        .expect('Content-Type', /json/)
        .expect(403)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000400);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with status 403 if token is valid and cant get current user', (done) => {
      let mockFindOne = {
        findOne: function() {
          return this;
        },
        select: function() {
          return this;
        },
        exec: (callback) => {
          callback(new Error('Oops'));
        }
      };
      let stub = sinon.stub(User, 'findOne').returns(mockFindOne);
      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .expect('Content-Type', /json/)
        .expect(403)
        .end((err, response) => {
          stub.restore();
          expect(response.body.code).to.equal(1000400);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with error if current password is invalid', (done) => {
      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send({
          password: "invalid",
          new_password: "newtestpassword"
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000201);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.contains('password')
          done();
        })
    });

    it('responds with error if some validation fails', (done) => {
      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send({
          firstname: "  ",
          lastname: "  "
        }) // Invalid update
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          expect(response.body.code).to.equal(1000200);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.contains('firstname');
          expect(response.body.errors).to.contains('lastname');
          done();
        })
    });

    it('responds with error if file is invalid', (done) => {
      // Mock s3 response
      nock('https://mean-skel.s3.amazonaws.com:443')
        .put(/.*picture*./)
        .reply(200, "", {
          'x-amz-id-2': '6pv/eHWz7VrUPAJNr15F3OzFiXIFi/QJU0UArw3pG7/xYSh5LaX+8RQDelmFp61bYuHvWXTJaWs=',
          'x-amz-request-id': '3F74105A9E031597',
          date: 'Tue, 02 Feb 2016 14:14:33 GMT',
          etag: '"21a280f3002ffdf828edd9b56eef380f"',
          'content-length': '0',
          server: 'AmazonS3',
          connection: 'close'
        });

      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send()
        .attach('picture', './test/fixtures/invalid-avatar.txt')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, response) => {
          nock.cleanAll();
          expect(response.body.code).to.equal(1000200);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.contains('picture.original_file.mimetype');
          done();
        })
    });


    it('responds with success and user info if the user was updated', (done) => {
      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send({
          firstname: "Derrick",
          lastname: "Faulkner"
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body.errors).to.not.exist;
          expect(response.body.user).to.exist;
          expect(response.body.user.email).to.equal(validUser.email);
          expect(response.body.user.firstname).to.equal("Derrick");
          expect(response.body.user.lastname).to.equal("Faulkner");
          expect(response.body.user._id).to.equal(String(validUser._id));
          done();
        })
    });

    it('responds with success on change password', () => {
      factory.create('user', {
        password: password
      }, (err, user) => {
        User.activateAccount(user.activation_token, () => {
          request(server)
            .post('/api/users/authenticate')
            .send({
              email: user.email,
              password: password
            })
            .end((err, res) => {
              expect(res.body.token).to.exist
              request(server)
                .put('/api/user')
                .set('x-access-token', res.body.token)
                .send({
                  password: password,
                  new_password: password + 'test'
                })
                .end((err, res) => {
                  expect(res.status).to.eq(200)
                  expect(res.body.user).to.exist;
                  expect(res.body.user.email).to.equal(user.email);
                  expect(res.body.user.firstname).to.equal(user.firstname);
                  expect(res.body.user.lastname).to.equal(user.lastname);
                  expect(res.body.user._id).to.equal(String(user._id));
                  User.findOne({
                    _id: user._id
                  }, "+password").then(updatedUser => {
                    expect(updatedUser.comparePassword(password + 'test')).to.equal(true)
                  })
                })
            })
        })
      })
    })

    it('uploads an avatar to user', (done) => {
      // Mock s3 response
      nock('https://mean-skel.s3.amazonaws.com:443')
        .put(/.*picture*./)
        .reply(200, "", {
          'x-amz-id-2': '6pv/eHWz7VrUPAJNr15F3OzFiXIFi/QJU0UArw3pG7/xYSh5LaX+8RQDelmFp61bYuHvWXTJaWs=',
          'x-amz-request-id': '3F74105A9E031597',
          date: 'Tue, 02 Feb 2016 14:14:33 GMT',
          etag: '"21a280f3002ffdf828edd9b56eef380f"',
          'content-length': '0',
          server: 'AmazonS3',
          connection: 'close'
        });

      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .attach('picture', './test/fixtures/avatar.png')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body.user.picture.url).to.exist;
          validUser.picture = response.body.user.picture;
          nock.cleanAll();
          done();
        });
    });

    it('modifies existing avatar', (done) => {
      // Mock s3 response
      nock('https://mean-skel.s3.amazonaws.com:443')
        .put(/.*picture*./)
        .reply(200, "", {
          'x-amz-id-2': '6pv/eHWz7VrUPAJNr15F3OzFiXIFi/QJU0UArw3pG7/xYSh5LaX+8RQDelmFp61bYuHvWXTJaWs=',
          'x-amz-request-id': '3F74105A9E031597',
          date: 'Tue, 02 Feb 2016 14:14:33 GMT',
          etag: '"21a280f3002ffdf828edd9b56eef380f"',
          'content-length': '0',
          server: 'AmazonS3',
          connection: 'close'
        });

      request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .attach('picture', './test/fixtures/avatar.png')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body.user.picture.url).to.exist;
          expect(response.body.user.picture.url).to.not.equal(validUser.picture.url);
          nock.cleanAll();
          done();
        });
    });
  });

});