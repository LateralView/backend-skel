var utils = require('../utils'),
    expect = require('chai').expect,
    User = require('../../app/models/user');

var factory = require('factory-girl');

describe('User', function () {

  describe('Valid User', function () {
    var validUser = null;
    var password = null;

    // Create a user and store it in validUser object
    before(function(done){
      factory.build("user", function (error, user) {
        if (!error){
          password = user.password;
          user.save(function(err, user){
            if(!err)
              validUser = user;
            else
              throw err;
          });
        }
        else
          throw error;

        done();
      });
    });

    it('saves password in an encrypted hash', function (done) {
    	expect(validUser.password).to.not.equal(null);
    	expect(validUser.password).to.not.equal(password);
    	expect(validUser.comparePassword(password)).to.equal(true);
    	done();
    });

    it('generates an activation token automatically', function (done) {
      expect(validUser.activation_token).to.not.equal(null);
      done();
    });

    it('is not active by default', function (done) {
      expect(validUser.active).to.equal(false);
      done();
    });

    it('activates their account', function (done) {
      User.activateAccount(validUser.activation_token, function(err, user){
        expect(err).to.not.exist;
        expect(user.active).to.equal(true);
        expect(user.activation_token).to.not.equal(validUser.activation_token);
        done();
      });
    });

  });

  describe('Invalid User', function () {

    it('is invalid without email', function (done) {
      factory.create("user", {email: null}, function (error, user) {
        expect(error).to.exist;
        email_error = error.errors.email;
        expect(email_error.message).to.equal("Email is required.");
        done();
      });
    });

    it('is invalid without firstname', function (done) {
      factory.create("user", {firstname: null}, function (error, user) {
        expect(error).to.exist;
        firstname_error = error.errors.firstname;
        expect(firstname_error.message).to.equal("First name is required.");
        done();
      });
    });

    it('is invalid without lastname', function (done) {
      factory.create("user", {lastname: null}, function (error, user) {
        expect(error).to.exist;
        lastname_error = error.errors.lastname;
        expect(lastname_error.message).to.equal("Last name is required.");
        done();
      });
    });

    it('is invalid without password', function (done) {
      factory.create("user", {password: null}, function (error, user) {
        expect(error).to.exist;
        password_error = error.errors.password;
        expect(password_error.message).to.equal("Password is required.");
        done();
      });
    });

    it('is invalid with a taken email', function (done) {
      factory.create("user", {email: "test@test.com"}, function (error, user) {
        // Create second user with same email
        factory.create("user", {email: "test@test.com"}, function (error, user) {
          expect(error).to.exist;
          expect(error.code).to.equal(11000); // duplicate entry
          done();
        });
      });
    });

    it('is invalid with an invalid email', function (done) {
      factory.create("user", {email: "test"}, function (error, user) {
        expect(error).to.exist;
        email_error = error.errors.email;
        expect(email_error.message).to.equal("Please fill a valid email address.");
        done();
      });
    });

    it('is invalid with a password length less than 8 characters', function (done) {
      factory.create("user", {password: "1234567"}, function (error, user) {
        expect(error).to.exist;
        password_error = error.errors.password;
        expect(password_error.message).to.equal("Password is too short.");
        done();
      });
    });
  });

});
