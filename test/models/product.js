const expect = require('chai').expect
const Product = require('../../app/models/product')
const s3Manager = require("../../app/helpers/s3Manager")
const sinon = require('sinon')
const bcrypt = require("bcrypt-nodejs")
const factory = require('factory-girl').factory
const { ROLES } = require('../../app/models/const/roles')

describe('Product', () => {

  describe('Valid Product', () => {
    it('creates valid product', async () => {
      const validProduct = await factory.create("product")
      expect(validProduct.name).to.not.equal(null);
      expect(validProduct.price).to.not.equal(null);
    });
  });

  describe('Invalid Product', () => {

    it('is invalid without name', async () => {
      try {
        await factory.create("product", { name: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let name_error = error.errors.name;
        expect(name_error.message).to.equal("Name is required.");
      }
    })

    it('is invalid without price', async () => {
      try {
        await factory.create("product", { price: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let price_error = error.errors.price
        expect(price_error.message).to.equal("Price is required.");
      }
    })

    it('is invalid with price 0', async () => {
      try {
        await factory.create("product", { price: 0 })
        throw new Error('this should fail')
      }
      catch (error) {
        let price_error = error.errors.price
        expect(price_error.message).to.equal("Price must be greather than 0.");
      }
    })

    it('is invalid with negative price', async () => {
      try {
        await factory.create("product", { price: -1 })
        throw new Error('this should fail')
      }
      catch (error) {
        let price_error = error.errors.price
        expect(price_error.message).to.equal("Price must be greather than 0.");
      }
    })

  })
})
