var factory = require('factory-girl'),
	MongooseAdapter = require('factory-girl-mongoose').MongooseAdapter,
	User = require('../app/models/user'),
	_ = require('lodash'),
	nock = require('nock'),
	faker = require('faker');

factory.setAdapter(MongooseAdapter);

var register = function() {
	// User factory
	factory.define('user', User, function(buildOptions){
		var attr = {
			email: faker.internet.email() || buildOptions.email,
			password: faker.internet.password() || buildOptions.password,
			firstname: faker.name.firstName() || buildOptions.firstname,
			lastname: faker.name.lastName() || buildOptions.lastname
		};
		
		if(!buildOptions.disableNock){
			//nock mail
			nock('https://api.sendgrid.com:443')
				.post(/.*send*./)
				.reply(200, {"message": "success"});
			
			//nock s3
			nock('https://mean-skel.s3.amazonaws.com:443')
				.put(/.*picture*./)
				.reply(200, "", { 'x-amz-id-2': '6pv/eHWz7VrUPAJNr15F3OzFiXIFi/QJU0UArw3pG7/xYSh5LaX+8RQDelmFp61bYuHvWXTJaWs=',
					'x-amz-request-id': '3F74105A9E031597',
					date: 'Tue, 02 Feb 2016 14:14:33 GMT',
					etag: '"21a280f3002ffdf828edd9b56eef380f"',
					'content-length': '0',
					server: 'AmazonS3',
					connection: 'close' });
		}
		
		return attr;
	}, {
		afterCreate: function(instance, attrs, callback){
			nock.cleanAll();
			callback(null, instance);
		}
	});
};

module.exports.register = register;