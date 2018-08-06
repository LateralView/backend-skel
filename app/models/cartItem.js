const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const shortid = require('shortid');
const s3Manager = require("../helpers/s3Manager");
const { ROLES } = require('./const/roles')
const Product = require('./product')

mongoose.Promise = global.Promise

class CartItem extends mongoose.Schema {
  constructor() {
    super({
      productId: {
        type : mongoose.Schema.ObjectId,
        ref: 'Product',
        required: "Product id is required."
      },
      quantity: {
        type: Number,
        required: "Quantity is required."
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    });

    this.plugin(require("./plugins/foregroundIndexesPlugin"));

    this.path('productId').validate(function (productId) {
      return Product.findOne({_id: productId})
    }, 'The specified productId was not found.');

    this.path('quantity').validate(function(quantity){
      return quantity && quantity > 0;
    }, "Quantity must be greather than 0.");

    this.methods.asJson = function() {
      return {
        _id: this._id,
        productId: this.productId,
        quantity: this.quantity
      }
    }

  }
}

module.exports = mongoose.model('CartItem', new CartItem());
