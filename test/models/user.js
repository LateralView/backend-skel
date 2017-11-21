const expect = require('chai').expect
const User = require('../../app/models/user')
const s3Manager = require("../../app/helpers/s3Manager")
const sinon = require('sinon')
const bcrypt = require("bcrypt-nodejs")
const factory = require('factory-girl').factory
const { ROLES } = require('../../app/models/const/roles')

describe('User', () => {

  describe('Valid User', () => {
    let validUser = null;
    let password = "testpassword";

    // Create a user and store it in validUser object
    before(async () => {
      // Create valid user
      validUser = await factory.create("user", { password })
    })

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

    it('activates their account', async () => {
      const user = await User.activateAccount(validUser.activation_token)
      expect(user.active).to.equal(true);
      expect(user.activation_token).to.not.equal(validUser.activation_token);
    })

    it('has default role', async () => {
      expect(validUser.role).to.equals(ROLES.DATA_ENTRY)
    })
  });

  describe('Invalid User', () => {

    it('is invalid without email', async () => {
      try {
        await factory.create("user", { email: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let email_error = error.errors.email;
        expect(email_error.message).to.equal("Email is required.");
      }
    })

    it('is invalid without firstname', async () => {
      try {
        await factory.create("user", { firstname: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let firstname_error = error.errors.firstname
        expect(firstname_error.message).to.equal("First name is required.");
      }
    })

    it('is invalid without lastname', async () => {
      try {
        await factory.create("user", { lastname: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let lastname_error = error.errors.lastname;
        expect(lastname_error.message).to.equal("Last name is required.");
      }
    })

    it('is invalid without password', async () => {
      try {
        await factory.create("user", { password: null })
        throw new Error('this should fail')
      }
      catch (error) {
        const password_error = error.errors.password
        expect(password_error.message).to.equal("Password is required.")
      }
    })

    it('is invalid with a taken email', async () => {
      await factory.create('user', { email: 'test@test.com' })
      try {
        await factory.create('user', { email: 'test@test.com' })
        throw new Error('this should fail')
      }
      catch (error) {
        expect(error).to.exist;
        expect(error.code).to.equal(11000); // duplicate entry
      }
    })

    it('is invalid with an invalid email', async () => {
      try {
        await factory.create('user', { email: 'test' })
        throw new Error('this should fail')
      }
      catch (error) {
        let email_error = error.errors.email;
        expect(email_error.message).to.equal("Please fill a valid email address.");
      }
    })

    it('is invalid with a password length less than 8 characters', async () => {
      try {
        await factory.create('user', { password: '1234567' })
        throw new Error('this should fail')
      }
      catch (error) {
        let password_error = error.errors.password;
        expect(password_error.message).to.equal("Password is too short.");
      }
    })

    it('is invalid with a non-image file as picture', async () => {
      try {
        await factory.create('user', {
          picture: {
            original_file: {
              mimetype: "application/zip"
            }
          }
        })
        throw new Error('this should fail')
      }
      catch (error) {
        let image_error = error.errors['picture.original_file.mimetype'];
        expect(image_error.message).to.equal("Invalid file.");
      }
    })

    it('is invalid if cant hash password', async () => {
      let stub = sinon.stub(bcrypt, 'hash').yields(new Error('Oops'));
      try {
        await factory.create('user')
        throw new Error('this should fail')
      }
      catch (error) {
        stub.restore();
        expect(error).to.exist;
      }
    })

    it('is invalid if has error at upload file', async () => {
      let stub = sinon.stub(s3Manager, 'uploadFile').yields(new Error('Oops'));
      try {
        await factory.create('user', {
          picture: {
            original_file: {
              mimetype: "image/jpeg"
            }
          }
        })
        throw new Error('this should fail')
      }
      catch (error) {
        stub.restore();
        expect(error).to.exist
      }
    })
  })
})
