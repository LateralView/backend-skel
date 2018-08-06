const expect = require('chai').expect
const CartItem = require('../../app/models/cartItem')
const s3Manager = require("../../app/helpers/s3Manager")
const sinon = require('sinon')
const bcrypt = require("bcrypt-nodejs")
const factory = require('factory-girl').factory
const { ROLES } = require('../../app/models/const/roles')
const mongoose = require('mongoose')

describe('CartItem', () => {

  describe('Valid CartItem', () => {
    it('creates valid cartItem', async () => {
      const validCartItem = await factory.create("cartItem")
      expect(validCartItem.productId).to.not.equal(null);
      expect(validCartItem.quantity).to.not.equal(null);
    });
  });

  describe('Invalid CartItem', () => {

    it('is invalid without product id', async () => {
      try {
        await factory.create("cartItem", { productId: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let productId_error = error.errors.productId;
        expect(productId_error.message).to.equal("Product id is required.");
      }
    })

    it('is invalid with a non existent product id', async () => {
      try {
        await factory.create("cartItem", { productId: new mongoose.Types.ObjectId })
        throw new Error('this should fail')
      }
      catch (error) {
        let productId_error = error.errors.productId;
        expect(productId_error.message).to.equal("The specified productId was not found.");
      }
    })

    it('is invalid without quantity', async () => {
      try {
        await factory.create("cartItem", { quantity: null })
        throw new Error('this should fail')
      }
      catch (error) {
        let quantity_error = error.errors.quantity
        expect(quantity_error.message).to.equal("Quantity is required.");
      }
    })

    it('is invalid with quantity 0', async () => {
      try {
        await factory.create("cartItem", { quantity: 0 })
        throw new Error('this should fail')
      }
      catch (error) {
        let quantity_error = error.errors.quantity
        expect(quantity_error.message).to.equal("Quantity must be greather than 0.");
      }
    })

    it('is invalid with negative quantity', async () => {
      try {
        await factory.create("cartItem", { quantity: -1 })
        throw new Error('this should fail')
      }
      catch (error) {
        let quantity_error = error.errors.quantity
        expect(quantity_error.message).to.equal("Quantity must be greather than 0.");
      }
    })

  })
})
