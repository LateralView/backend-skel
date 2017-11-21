const User = require('../../app/models/user')
const faker = require('faker')

module.exports = (factory) => {
	factory.define('user', User, (buildOptions) => {
		return {
			email: faker.internet.email() || buildOptions.email,
			password: faker.internet.password() || buildOptions.password,
			firstname: faker.name.firstName() || buildOptions.firstname,
			lastname: faker.name.lastName() || buildOptions.lastname
		}
  })
}
