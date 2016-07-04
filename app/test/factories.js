var factory = require('factory-girl'),
	MongooseAdapter = require('factory-girl-mongoose').MongooseAdapter,
	User = require('../models/user'),
	faker = require('faker');

factory.setAdapter(MongooseAdapter);

var register = function() {
	// User factory
	factory.define('user', User, {
		email: function() {
			return faker.internet.email();
		},
		password: faker.internet.password(),
		firstname: faker.name.firstName(),
		lastname: faker.name.lastName()
	});
}

module.exports.register = register;