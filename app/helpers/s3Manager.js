var config = require('../../config').config(),
		aws = require('aws-sdk'),
		fs = require('fs');

aws.config.update({
	accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
	secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY
});

aws.config.region = config.aws.region;

function uploadFile(file, path, next) {
	var filePath = path + "/" + file.name;
	var body = fs.createReadStream(file.path);

	// Handle read stream error
	body.on('error', function(error){
		return next(error);
	});

	body.on('open', function (){
		try {
			var s3obj = new aws.S3({params: {Bucket: config.aws.S3_BUCKET_NAME, Key: filePath}});
			s3obj.upload({Body: body, ContentType: file.mimetype}).
			  send(function(err, data) {
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

module.exports = new S3ManagerHelper();
