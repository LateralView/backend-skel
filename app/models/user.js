var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  bcrypt = require("bcrypt-nodejs"),
  shortid = require('shortid'),
  mailer = require("../helpers/mailer");

var validateEmail = function(email) {
  var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email)
};

// user schema
var UserSchema = new Schema({
  email: { type: String, trim: true, required: "Email is required.", index: { unique: true }, validate: [validateEmail, "Please fill a valid email address."]},
  password: { type: String, required: "Password is required.", select: false, minlength: [8, "Password is too short." ] },
  firstname: { type: String, trim: true, required: "First name is required."},
  lastname: { type: String, trim: true, required: "Last name is required."},
  activation_token: { type: String, select: false, unique: true, 'default': shortid.generate },
  active: { type: Boolean, default: false, select: false },
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

UserSchema.pre("save", function(next) {
    this.wasNew = this.isNew;
    next();
});

// Send welcome email with activation link
UserSchema.post("save", function(user) {
  if (user.wasNew && process.env.NODE_ENV != 'test') {
    mailer.activationEmail(user);
  }
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

UserSchema.methods.asJson = function() {
  var user = this;
  response_user = {
                _id: user._id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname
              }
  return response_user;
};

UserSchema.methods.activateAccount = function(next) {
  var user = this;
  user.active = true;
  user.save(function(err){
    next(err);
  });
};

module.exports = mongoose.model("User", UserSchema);
