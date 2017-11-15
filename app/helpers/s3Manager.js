const awsSdk = require('aws-sdk');
const fs = require('fs');

class S3ManagerHelper {
  constructor() {
    this.aws = awsSdk;
    this.aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    this.aws.config.region = process.env.AWS_REGION;
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
        let s3obj = new this.aws.S3({
          params: {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: filePath
          }
        });
        s3obj.upload({
          Body: body,
          ContentType: file.mimetype
        }).
        send((err) => {
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
    try {
      let s3 = new this.aws.S3();
      let params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
      };

      s3.deleteObject(params, (err) => {
        next(err);
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new S3ManagerHelper();