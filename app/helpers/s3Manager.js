const config = require('../../config').config();
const awsSdk = require('aws-sdk');
const fs = require('fs');

class S3ManagerHelper {
  constructor() {
    this.aws = awsSdk;
    this.aws.config.update({
      accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY
    });

    this.aws.config.region = config.aws.region;
  }

  uploadFile(file, path, next) {
    const filePath = path + "/" + file.name;
    const body = fs.createReadStream(file.path);

    // Handle read stream error
    body.on('error', (error) => {
      return next(error);
    });

    body.on('open', () => {
      try {
        let s3obj = new this.aws.S3({params: {Bucket: config.aws.S3_BUCKET_NAME, Key: filePath}});
        s3obj.upload({Body: body, ContentType: file.mimetype}).
          send((err, data) => {
            if (err)
            next(err);
          else
            next(null, filePath);
          });
      } catch (err) {
        next(err);
      }
    });
  }

  deleteFile(key, next) {
    try{
      let s3 = new this.aws.S3();
      let params = {
        Bucket: config.aws.S3_BUCKET_NAME,
        Key: key
      };

      s3.deleteObject(params, (err, data) => {
        next(err);
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new S3ManagerHelper();
