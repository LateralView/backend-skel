var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  bcrypt = require("bcrypt-nodejs"),
  shortid = require('shortid'),
  mailer = require("../helpers/mailer"),
  config = require("../../config").config(),
  s3Manager = require("../helpers/s3Manager"),
  fs = require("fs");

var validateEmail = function(email) {
  var regex = /^\w+([\+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
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
  picture: {
    original_file: {
      fieldname: String,
      originalname: String,
      name: String,
      encoding: String,
      mimetype: String,
      path: String,
      extension: String,
      size: Number,
      truncated: Boolean,
      buffer: Buffer
    },  
    path: String,
    url: String
  },
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

// Upload picture to s3
UserSchema.pre('save', function(next) {
  var user = this;
  if(user.isNew || (user.picture.url && !user.isModified("picture.url"))) {
    return next();
  }

  // Check if S3 keys are set
  if(!config.aws.AWS_ACCESS_KEY_ID || !config.aws.AWS_SECRET_ACCESS_KEY || !config.aws.S3_BUCKET_NAME) {
    if(user.picture && user.picture.original_file && user.picture.original_file.name) {
      fs.unlink(__dirname + "/../../uploads/" + user.picture.original_file.name);
      user.picture = null;
    }
    return next();
  }
  s3Manager.uploadFile(user.picture.original_file, "picture/" + user._id, function(err, path) {
    if (err) {
      return next(err);
    }   
    user.set("picture.path", path);
    user.set("picture.url", config.aws.url_base + config.aws.S3_BUCKET_NAME + "/" + path);
    fs.unlink(__dirname + "/../../uploads/" + user.picture.original_file.name);
    next();
  }); 
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
                lastname: user.lastname,
                picture: user.picture
              }
  return response_user;
};

UserSchema.statics.activateAccount = function(token, callback) {
  this.findOneAndUpdate({ activation_token: token, active: false }, { active: true }, { select: "active", new: true }, function (err, user){
    callback(err, user);
  });
};

module.exports = mongoose.model("User", UserSchema);
