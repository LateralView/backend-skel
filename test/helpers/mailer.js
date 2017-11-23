const nock = require('nock');
const expect = require('chai').expect;
const factory = require('factory-girl').factory
const mailer = require('../../app/helpers/mailer');

describe('mailer Helper', () => {
  let validUser = null;

  before(async () => {
    // Create user
    validUser = await factory.create("user")
  })

  it('returns error if delivery fails', (done) => {
    nock('https://api.sendgrid.com:443')
      .post(/.*send*./)
      .reply(400, {
        "errors": ["The provided authorization grant is invalid, expired, or revoked"],
        "message": "error"
      });

    mailer.sendActivationEmail(validUser, (error) => {
      nock.cleanAll();
      expect(error).to.exist;
      expect(error.message).to.equal('The provided authorization grant is invalid, expired, or revoked');
      done();
    });
  });

  it('do not return error if delivery success', (done) => {
    nock('https://api.sendgrid.com:443')
      .post(/.*send*./)
      .reply(200, {
        "message": "success"
      });

    mailer.sendActivationEmail(validUser, (error) => {
      nock.cleanAll();
      expect(error).to.not.exist;
      done();
    });
  });

  it('returns error if request fails', (done) => {
    nock('https://api.sendgrid.com:443')
      .post(/.*send*./)
      .replyWithError('Some error');

    mailer.sendActivationEmail(validUser, (error) => {
      nock.cleanAll();
      expect(error).to.exist;
      done();
    });
  });

  it('Call catch error for wrong parameter', (done) => {
    nock('https://api.sendgrid.com:443')
      .post(/.*send*./)
      .reply(200, {
        "message": "success"
      });
    mailer.sendActivationEmail(null, (error) => {
      expect(error).to.exist;
      done();
    });
  });
});
