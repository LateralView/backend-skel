module.exports = {
  "port": process.env.PORT || 8080,
  "database": {
    "production": "mongodb://localhost/database_prod",
    "development": "mongodb://localhost/database_dev",
    "test": "mongodb://localhost/database_test"
  },
  "secret": "28d05cba81d2be2757caae5a10e86f0ec5e65d64d858bda0107efe592",
  "aws": {
    "AWS_ACCESS_KEY_ID": "",
    "AWS_SECRET_ACCESS_KEY": "",
    "S3_BUCKET_NAME": "",
    "region": "us-east-1",
    "url_base": "https://s3.amazonaws.com/"
  }
};
