const mongoose = require('mongoose')
const request = require('supertest');
const factory = require('factory-girl').factory
const User = require('../../app/models/user');
const nock = require('nock');
const expect = require('chai').expect;
const sinon = require('sinon');
const { ROLES } = require('../../app/models/const/roles')

require('sinon-as-promised')

describe('UsersHandler', () => {
  describe('POST /api/users/authenticate', () => {
    let validUser = null;
    let password = "testpassword";
    let server;

    before(async () => {
      server = require('../../server');
      // Create valid user
      validUser = await factory.create('user', { password })
    })


    it('responds with error if user does not exist', (done) => {
      request(server)
        .post('/api/users/authenticate')
        .send({
          email: 'notregistered@email.com',
          password: 'testtest'
        })
        .end((err, response) => {
          expect(response.status).to.equal(401);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with error if get error from mongo', (done) => {
      let stub = sinon.stub(mongoose.Model, 'findOne').rejects(new Error('Oops'))
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
          expect(response.body.code).to.equal(1000101);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done()
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
          expect(response.body.code).to.equal(1000102);
          expect(response.body.message).to.exist;
          expect(response.body.detail).to.exist;
          expect(response.body.errors).to.be.empty;
          done();
        })
    });

    it('responds with token and user info if login success', async () => {
      // Set active flag as true
      const user = await factory.create('user', { password: password, active: true })
      const response = await request(server)
        .post('/api/users/authenticate')
        .send({
          email: user.email,
          password: password
        })
      expect(response.body.token).to.exist;
      expect(response.body.user).to.exist;
      expect(response.body.user.email).to.equal(user.email);
      expect(response.body.user.firstname).to.equal(user.firstname);
      expect(response.body.user.lastname).to.equal(user.lastname);
      expect(response.body.user._id).to.equal(String(user._id));
    });

  });

  describe('POST /api/users', () => {
    let validUser = null;
    let password = "testpassword";
    let server;

    before(async () => {
      server = require('../../server');
      // Create valid user
      validUser = await factory.create('user', { password })
    })


    it('responds with error if email exist', async () => {
      const response = await request(server)
        .post('/api/users')
        .send({
          email: validUser.email,
          password: 'testtest',
          firstname: 'James',
          lastname: 'Doe'
        })
      expect(response.status).to.equal(409)
      expect(response.body.code).to.equal(1000001);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.contains('email');
    })

    it('responds with error if some validation fails', async () => {
      const response = await request(server)
        .post('/api/users')
        .send({
          email: "invalidemail",
          password: 'testtest',
          firstname: 'James',
          lastname: 'Doe'
        })
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000000)
      expect(response.body.message).to.exist
      expect(response.body.detail).to.exist
      expect(response.body.errors).to.contains('email')
    });

    it('responds with success if the user was created', async () => {
      const user = await factory.build('user')
      const response = await request(server)
        .post('/api/users')
        .send({
          email: user.email,
          password: user.password,
          firstname: user.firstname,
          lastname: user.lastname
        })
      expect(response.status).to.equal(201)
      expect(response.body.message).to.exist
      expect(response.body.user).to.exist
      expect(response.body.user._id).to.exist
      expect(response.body.user.email).to.equal(user.email)
    });

  });

  describe('POST /api/users/activate', () => {
    let password = "testpassword"
    let server

    before(async () => {
      server = require('../../server');
      // Create valid user
      await factory.create('user', { password, active: true })
    })

    it('responds with error if token does not exist', async () => {
      const response = await request(server)
        .post('/api/users/activate')
        .send({
          activation_token: 'invalidtoken'
        })
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000301);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.contains('activation_token');
    })

    it('responds with error from activateAccount method', async () => {
      let stub = sinon.stub(User, 'activateAccount').yields({
        message: 'Oops'
      })

      const response = await request(server)
        .post('/api/users/activate')
        .send({
          activation_token: 'invalidtoken'
        })
      stub.restore();
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000300);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.be.empty;
    })

    it('responds with success if the user was activated', async () => {
      const user = await factory.create('user', { password })
      const response = await request(server)
        .post('/api/users/activate')
        .send({
          activation_token: user.activation_token
        })
      expect(response.status).to.equal(200)
      expect(response.body.message).to.exist;
      expect(response.body.message).to.equal("Account activated.");
    })

  })

  describe('PUT /api/user', () => {
    let access_token;
    let validUser = null;
    let password = "testpassword";
    let server;

    before(async () => {
      server = require('../../server');

      // Create valid user
      validUser = await factory.create('user', { password, active: true })

      // Authenticate user
      const res = await request(server)
        .post('/api/users/authenticate')
        .send({
          email: validUser.email,
          password: password
        })
      access_token = res.body.token
    })

    it('responds with status 403 if token is not present', async () => {
      const response = await request(server)
        .put('/api/user')
      expect(response.status).to.equal(403)
      expect(response.body.code).to.equal(1000401);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.be.empty;
    })

    it('responds with status 403 if token is invalid', async () => {
      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', 'invalidtoken')
      expect(response.status).to.equal(403)
      expect(response.body.code).to.equal(1000400);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.be.empty;
    });

    it('responds with status 403 if token is valid and cant get current user', async () => {
      let stub = sinon.stub(mongoose.Model, 'findOne').rejects(new Error('Oops'))
      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
      stub.restore();
      expect(response.status).to.equal(403)
      expect(response.body.code).to.equal(1000400);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.be.empty;
    })

    it('responds with error if current password is invalid', async () => {
      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send({
          password: "invalid",
          new_password: "newtestpassword"
        })
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000201);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.contains('password')
    })

    it('responds with error if some validation fails', async () => {
      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send({
          firstname: "  ",
          lastname: "  "
        }) // Invalid update
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000200);
      expect(response.body.message).to.exist;
      expect(response.body.detail).to.exist;
      expect(response.body.errors).to.contains('firstname');
      expect(response.body.errors).to.contains('lastname');
    });

    it('responds with error if file is invalid', async () => {
      // Mock s3 response
      nock('https://mean-skel.s3.amazonaws.com:443')
        .put(/.*picture.*/)
        .reply(200, "", {
          'x-amz-id-2': '6pv/eHWz7VrUPAJNr15F3OzFiXIFi/QJU0UArw3pG7/xYSh5LaX+8RQDelmFp61bYuHvWXTJaWs=',
          'x-amz-request-id': '3F74105A9E031597',
          date: 'Tue, 02 Feb 2016 14:14:33 GMT',
          etag: '"21a280f3002ffdf828edd9b56eef380f"',
          'content-length': '0',
          server: 'AmazonS3',
          connection: 'close'
        })

      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .attach('picture', './test/fixtures/invalid-avatar.txt')
        .send()
      nock.cleanAll()
      expect(response.status).to.equal(400)
      expect(response.body.code).to.equal(1000200)
      expect(response.body.message).to.exist
      expect(response.body.detail).to.exist
      expect(response.body.errors).to.contains('picture.original_file.mimetype')
    })


    it('responds with success and user info if the user was updated', async () => {
      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .send({
          firstname: "Derrick",
          lastname: "Faulkner"
        })
      expect(response.status).to.equal(200)
      expect(response.body.errors).to.not.exist
      expect(response.body.user).to.exist
      expect(response.body.user.email).to.equal(validUser.email)
      expect(response.body.user.firstname).to.equal("Derrick")
      expect(response.body.user.lastname).to.equal("Faulkner")
      expect(response.body.user._id).to.equal(String(validUser._id))
    })

    it('responds with success on change password', async () => {
      const user = await factory.create('user', { password })
      await User.activateAccount(user.activation_token)
      let res = await request(server)
        .post('/api/users/authenticate')
        .send({
          email: user.email,
          password: password
        })
      expect(res.body.token).to.exist
      res = await request(server)
        .put('/api/user')
        .set('x-access-token', res.body.token)
        .send({
          password: password,
          new_password: password + 'test'
        })
      expect(res.status).to.eq(200)
      expect(res.body.user).to.exist;
      expect(res.body.user.email).to.equal(user.email);
      expect(res.body.user.firstname).to.equal(user.firstname);
      expect(res.body.user.lastname).to.equal(user.lastname);
      expect(res.body.user._id).to.equal(String(user._id));

      const updatedUser = await User.findOne({ _id: user._id }, "+password")
      expect(updatedUser.comparePassword(password + 'test')).to.equal(true)
    })

    it('uploads an avatar to user', async () => {
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

      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .attach('picture', './test/fixtures/avatar.png')
      expect(response.status).to.equal(200)
      expect(response.body.user.picture.url).to.exist
      validUser.picture = response.body.user.picture
      nock.cleanAll()
    })

    it('modifies existing avatar', async () => {
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

      const response = await request(server)
        .put('/api/user')
        .set('x-access-token', access_token)
        .attach('picture', './test/fixtures/avatar.png')
      expect(response.status).to.equal(200)
      expect(response.body.user.picture.url).to.exist;
      expect(response.body.user.picture.url).to.not.equal(validUser.picture.url);
      nock.cleanAll();
    });
  });

  describe('GET /api/users', () => {
    let server
    let user
    let admin
    let access_token
    const password = '123123123'

    before(async () => {
      server = require('../../server')

      // Create valid user
      user = await factory.create('user', { password, active: true })
      admin = await factory.create('user', { password, active: true, role: ROLES.ADMIN })

    });

    it('retreives a list of users', async () => {
      let res = await request(server)
        .post('/api/users/authenticate')
        .send({
          email: admin.email,
          password: password
        })
      access_token = res.body.token
      res = await request(server)
        .get('/api/users')
        .set('x-access-token', access_token)
      expect(res.status).to.eq(200)
    })

    it('fails for a non-admin user', async () => {
      let res = await request(server)
        .post('/api/users/authenticate')
        .send({
          email: user.email,
          password: password
        })
      access_token = res.body.token
      res = await request(server)
        .get('/api/users')
        .set('x-access-token', access_token)
      expect(res.status).to.equal(401)
    })
  })

});
