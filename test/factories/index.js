const _ = require('lodash')
const factoryGirl = require('factory-girl')
const factory = factoryGirl.factory
factory.setAdapter(new factoryGirl.MongooseAdapter())

const userFactory = require('./userFactory')
const productFactory = require('./productFactory')
const cartItemFactory = require('./cartItemFactory')

module.exports = () => {
  if (!_.has(factory, 'factories.user')) userFactory(factory)
  if (!_.has(factory, 'factories.product')) productFactory(factory)
  if (!_.has(factory, 'factories.cartItem')) cartItemFactory(factory)
}
