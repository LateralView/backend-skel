const _ = require('lodash')
const factoryGirl = require('factory-girl')
const factory = factoryGirl.factory
factory.setAdapter(new factoryGirl.MongooseAdapter())

const userFactory = require('./userFactory')

module.exports = () => {
  if (!_.has(factory, 'factories.user')) userFactory(factory)
}
