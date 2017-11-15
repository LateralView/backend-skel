const expect = require('chai').expect;
const User = require('../../app/models/user');
const s3Manager = require("../../app/helpers/s3Manager");
const sinon = require('sinon');
const bcrypt = require("bcrypt-nodejs");
const factory = require('factory-girl');

describe('User', () => {

  describe('Valid User', () => {
    let validUser = null;
    let password = "testpassword";

    // Create a user and store it in validUser object
    before((done) => {
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

    it('saves password in an encrypted hash', (done) => {
      expect(validUser.password).to.not.equal(null);
      expect(validUser.password).to.not.equal(password);
      expect(validUser.comparePassword(password)).to.equal(true);
      done();
    });

    it('generates an activation token automatically', (done) => {
      expect(validUser.activation_token).to.not.equal(null);
      done();
    });

    it('is not active by default', (done) => {
      expect(validUser.active).to.equal(false);
      done();
    });

    it('activates their account', (done) => {
      User.activateAccount(validUser.activation_token, (err, user) => {
        expect(err).to.not.exist;
        expect(user.active).to.equal(true);
        expect(user.activation_token).to.not.equal(validUser.activation_token);
        done();
      });
    });

  });

  describe('Invalid User', () => {

    it('is invalid without email', (done) => {
      factory.create("user", {
        email: null
      }, error => {
        expect(error).to.exist;
        let email_error = error.errors.email;
        expect(email_error.message).to.equal("Email is required.");
        done();
      });
    });

    it('is invalid without firstname', (done) => {
      factory.create("user", {
        firstname: null
      }, error => {
        expect(error).to.exist;
        let firstname_error = error.errors.firstname;
        expect(firstname_error.message).to.equal("First name is required.");
        done();
      });
    });

    it('is invalid without lastname', (done) => {
      factory.create("user", {
        lastname: null
      }, error => {
        expect(error).to.exist;
        let lastname_error = error.errors.lastname;
        expect(lastname_error.message).to.equal("Last name is required.");
        done();
      });
    });

    it('is invalid without password', (done) => {
      factory.create("user", {
        password: null
      }, error => {
        expect(error).to.exist;
        const password_error = error.errors.password;
        expect(password_error.message).to.equal("Password is required.");
        done();
      });
    });

    it('is invalid with a taken email', (done) => {
      factory.create("user", {
        email: "test@test.com"
      }, () => {
        // Create second user with same email
        factory.create("user", {
          email: "test@test.com"
        }, error => {
          expect(error).to.exist;
          expect(error.code).to.equal(11000); // duplicate entry
          done();
        });
      });
    });

    it('is invalid with an invalid email', (done) => {
      factory.create("user", {
        email: "test"
      }, error => {
        expect(error).to.exist;
        let email_error = error.errors.email;
        expect(email_error.message).to.equal("Please fill a valid email address.");
        done();
      });
    });

    it('is invalid with a password length less than 8 characters', (done) => {
      factory.create("user", {
        password: "1234567"
      }, error => {
        expect(error).to.exist;
        let password_error = error.errors.password;
        expect(password_error.message).to.equal("Password is too short.");
        done();
      });
    });

    it('is invalid with a non-image file as picture', (done) => {
      factory.create("user", {
        picture: {
          original_file: {
            mimetype: "application/zip"
          }
        }
      }, error => {
        expect(error).to.exist;
        let image_error = error.errors['picture.original_file.mimetype'];
        expect(image_error.message).to.equal("Invalid file.");
        done();
      });
    });

    it('is invalid if cant hash password', (done) => {
      let stub = sinon.stub(bcrypt, 'hash').yields(new Error('Oops'));
      factory.create("user", err => {
        stub.restore();
        expect(err).to.exist;
        done();
      });
    });

    it('is invalid if has error at upload file', (done) => {
      let stub = sinon.stub(s3Manager, 'uploadFile').yields(new Error('Oops'));
      factory.create("user", {
        picture: {
          original_file: {
            mimetype: "image/jpeg"
          }
        }
      }, err => {
        stub.restore();
        expect(err).to.exist;
        done();
      });
    });
  });

});