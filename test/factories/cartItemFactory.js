const CartItem = require('../../app/models/cartItem')
const faker = require('faker')

module.exports = (factory) => {
	factory.define('cartItem', CartItem, (buildOptions) => {
		return {
			productId: factory.assoc('product', '_id') || buildOptions.productId,
			quantity: faker.random.number() || buildOptions.quantity,
		}
  })
}
