var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  bcrypt = require("bcrypt-nodejs"),
  shortid = require('shortid');

var validateEmail = function(email) {
  var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email)
};

// user schema
var UserSchema = new Schema({
  email: { type: String, trim: true, required: "Email is required.", index: { unique: true }, validate: [validateEmail, "Please fill a valid email address."]},
  password: { type: String, required: "Password is required.", select: false, minlength: [8, "Password is too short." ] },
  activation_token: { type: String, select: false, unique: true, 'default': shortid.generate },
  active: { type: Boolean, default: true, select: false }, // TODO: activate account by email
  created_at: { type: Date, default: Date.now }
});

// hash password before user is saved
UserSchema.pre("save", function(next) {
  var user = this;
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("User", UserSchema);
