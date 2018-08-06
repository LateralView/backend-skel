const Product = require('../../app/models/product')
const faker = require('faker')

module.exports = (factory) => {
	factory.define('product', Product, (buildOptions) => {
		return {
			name: faker.commerce.productName() || buildOptions.name,
			price: faker.commerce.price() || buildOptions.price,
		}
  })
}
