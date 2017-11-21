const nock = require('nock');
const expect = require('chai').expect;
const factory = require('factory-girl').factory
const aws = require('aws-sdk');
const sinon = require('sinon');
const s3Manager = require('../../app/helpers/s3Manager');

describe('s3Manager Helper', () => {
  let validUser = null;

  before(async () => {
    // Create user
    validUser = await factory.create('user')
  })

  describe("upload file", () => {
    it('returns file path if upload success', (done) => {
      // Mock s3 response
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
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

      let file = {
        name: "avatar.png",
        path: "./test/fixtures/avatar.png",
        mimetype: "image/png"
      };

      s3Manager.uploadFile(file, "picture/" + validUser._id, (err, path) => {
        nock.cleanAll();
        expect(err).to.not.exist;
        expect(path).to.eq("picture/" + validUser._id + "/avatar.png");
        done();
      });
    });

    it('returns error if file does not exist', (done) => {
      let file = {
        name: "avatar.png",
        path: "./invalid/path/image.png",
        mimetype: "image/png"
      };

      s3Manager.uploadFile(file, "picture/" + validUser._id, err => {
        expect(err).to.exist;
        expect(err.code).to.equal("ENOENT");
        done();
      });
    });

    it('returns error if response is an error', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .put(/.*picture*./)
        .reply(403, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Error><Code>InvalidAccessKeyId</Code><Message>The AWS Access Key Id you provided does not exist in our records.</Message><AWSAccessKeyId>TEST_KEY</AWSAccessKeyId><RequestId>19F25D5603FE3C5D</RequestId><HostId>SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=</HostId></Error>", {
          'x-amz-request-id': '19F25D5603FE3C5D',
          'x-amz-id-2': 'SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=',
          'content-type': 'application/xml',
          'transfer-encoding': 'chunked',
          date: 'Tue, 02 Feb 2016 19:36:15 GMT',
          server: 'AmazonS3',
          connection: 'close'
        });

      let file = {
        name: "avatar.png",
        path: "./test/fixtures/avatar.png",
        mimetype: "image/png"
      };

      s3Manager.uploadFile(file, "picture/" + validUser._id, err => {
        nock.cleanAll();
        expect(err).to.exist;
        expect(err.message).to.equal('The AWS Access Key Id you provided does not exist in our records.');
        done();
      });
    });

    it('returns error if the request fails', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .put(/.*picture*./)
        .replyWithError('Some error');

      let file = {
        name: "avatar.png",
        path: "./test/fixtures/avatar.png",
        mimetype: "image/png"
      };

      s3Manager.uploadFile(file, "picture/" + validUser._id, err => {
        nock.cleanAll();
        expect(err).to.exist;
        done();
      });
    });

    it('returns error if aws sdk throw error', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .put(/.*picture*./)
        .replyWithError('Some error');

      let file = {
        name: "avatar.png",
        path: "./test/fixtures/avatar.png",
        mimetype: "image/png"
      };

      let stub = sinon.stub(aws, 'S3', () => {
        return {
          upload: () => {
            throw new Error('Oops');
          }
        }
      });

      s3Manager.uploadFile(file, "picture/" + validUser._id, err => {
        nock.cleanAll();
        stub.restore();
        expect(err).to.exist;
        done();
      });
    });
  });

  describe("delete file", () => {
    it('deletes file successfully', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .delete(/.*picture*./)
        .reply(204, "", {
          'x-amz-id-2': 'zfAvIl4BX0ILfVzehFzEj8hzxhJKQBhWISbU0QoWTuZHUu7R5MtmH+SHK65rgxRiEXfMoRRIsXQ=',
          'x-amz-request-id': '4681858C4C9D2F51',
          date: 'Tue, 02 Feb 2016 18:15:39 GMT',
          server: 'AmazonS3',
          connection: 'close'
        });

      s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", (err) => {
        nock.cleanAll();
        expect(err).to.not.exist;
        done();
      });
    });

    it('returns error if response is an error', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .delete(/.*picture*./)
        .reply(403, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Error><Code>InvalidAccessKeyId</Code><Message>The AWS Access Key Id you provided does not exist in our records.</Message><AWSAccessKeyId>TEST_KEY</AWSAccessKeyId><RequestId>19F25D5603FE3C5D</RequestId><HostId>SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=</HostId></Error>", {
          'x-amz-request-id': '19F25D5603FE3C5D',
          'x-amz-id-2': 'SFpA1tktdCW8iEhMsEgeTLaYf8ZIAVq6EtYWU44ZhM/3qsy9bTP8gswERuVJjX48aHq5vU+jQGQ=',
          'content-type': 'application/xml',
          'transfer-encoding': 'chunked',
          date: 'Tue, 02 Feb 2016 19:36:15 GMT',
          server: 'AmazonS3',
          connection: 'close'
        });

      s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", (err) => {
        nock.cleanAll();
        expect(err).to.exist;
        expect(err.message).to.equal('The AWS Access Key Id you provided does not exist in our records.');
        done();
      });
    });

    it('returns error if the request fails', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .delete(/.*picture*./)
        .replyWithError('Some error');

      s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", (err) => {
        nock.cleanAll();
        expect(err).to.exist;
        done();
      });
    });

    it('returns error if aws sdk throw error', (done) => {
      nock(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com:443`)
        .put(/.*picture*./)
        .replyWithError('Some error');

      let stub = sinon.stub(aws, 'S3', () => {
        return {
          deleteObject: () => {
            throw new Error('Oops');
          }
        }
      });

      s3Manager.deleteFile("picture/56b0f1d8a60d504834ffe605/avatar.png", err => {
        nock.cleanAll();
        stub.restore();
        expect(err).to.exist;
        done();
      });
    });

  });


});
