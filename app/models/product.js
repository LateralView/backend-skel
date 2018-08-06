const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const shortid = require('shortid');
const s3Manager = require("../helpers/s3Manager");
const { ROLES } = require('./const/roles')

mongoose.Promise = global.Promise

class Product extends mongoose.Schema {
  constructor() {
    super({
      name: {
        type: String,
        trim: true,
        required: "Name is required."
      },
      price: {
        type: Number,
        required: "Price is required."
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    });

    this.plugin(require("./plugins/foregroundIndexesPlugin"));

    this.path('price').validate(function(price){
      return price && price > 0;
    }, "Price must be greather than 0.");

    this.methods.asJson = function() {
      return {
        _id: this._id,
        name: this.name,
        price: this.price
      }
    }

  }
}

module.exports = mongoose.model('Product', new Product());
