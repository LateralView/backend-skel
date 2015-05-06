var config = require('../../config'),
		aws = require('aws-sdk'),
		fs = require('fs');

aws.config.update({
	accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
	secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY
});

aws.config.region = config.aws.region;

function uploadFile(file, path, next) {
	try{
		var filePath = path + "/" + file.name;
		var s3 = new aws.S3();
		var params = { Bucket: config.aws.S3_BUCKET_NAME,
					   Key: filePath,
					   Body: fs.readFileSync('./' + file.path),
					   ContentType: file.mimetype };

		s3.putObject(params, function(err, data) {
			if (err)
				next(err);
			else
				next(null, filePath);
		});
	} catch (err) {
		next(err);
	}
};

function deleteFile(key, next) {
	try{
		var s3 = new aws.S3();
		var params = {
		  Bucket: config.aws.S3_BUCKET_NAME,
		  Key: key
		};

		s3.deleteObject(params, function(err, data) {
			next(err);
		});
	} catch (err) {
		next(err);
	}
}

exports.uploadFile = uploadFile;
exports.deleteFile = deleteFile;

