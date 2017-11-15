const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const shortid = require('shortid');
const mailer = require("../helpers/mailer");
const s3Manager = require("../helpers/s3Manager");

class User extends mongoose.Schema {
  constructor() {
    super({
      email: {
        type: String,
        trim: true,
        required: "Email is required.",
        index: {
          unique: true
        }
      },
      password: {
        type: String,
        required: "Password is required.",
        select: false,
        minlength: [8, "Password is too short."]
      },
      firstname: {
        type: String,
        trim: true,
        required: "First name is required."
      },
      lastname: {
        type: String,
        trim: true,
        required: "Last name is required."
      },
      activation_token: {
        type: String,
        select: false,
        unique: true,
        'default': shortid.generate
      },
      active: {
        type: Boolean,
        default: false,
        select: false
      },
      picture: {
        original_file: {
          fieldname: String,
          originalname: String,
          name: String,
          encoding: String,
          mimetype: {
            type: String,
            default: ''
          },
          path: String,
          extension: String,
          size: Number,
          truncated: Boolean,
          buffer: Buffer
        },
        path: String,
        url: String
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    });

    this.plugin(require("./plugins/foregroundIndexesPlugin"));
    this.path('email').validate((value) => {
      return /^\w+([\+\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
    }, 'Please fill a valid email address.');

    this.path('picture.original_file.mimetype').validate((value) => {
      if (value) {
        let mimetypes = ["image/jpeg", "image/png"];
        return (mimetypes.indexOf(value) > -1);
      } else {
        return true;
      }
    }, 'Invalid file.');


    /**
     * TODO: We have to proper handling these methods as part of the inherited class
     * NOTE: I keep the 'function' notation here, because we DO need to have `this`
     * reference within the function context.
     *
     */
    // hash password before user is saved
    this.pre("save", function(next) {
      if (!this.isModified("password")) {
        return next();
      }

      bcrypt.hash(this.password, null, null, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next();
      });
    });

    this.pre("save", function(next) {
      this.wasNew = this.isNew;
      next();
    });

    // Upload picture to s3
    this.pre('save', function(next) {
      if (!this.isModified("picture")) {
        return next();
      }

      s3Manager.uploadFile(this.picture.original_file, "picture/" + this._id, (err, path) => {
        if (err) return next(err);

        this.set("picture.path", path);
        this.set("picture.url", process.env.AWS_URL_BASE + process.env.AWS_S3_BUCKET_NAME + "/" + path);
        next();
      });
    });


    // Send welcome email with activation link
    this.post("save", function(user) {
      if (user.wasNew) {
        mailer.sendActivationEmail(user, function() {
          // TODO: Handle error if exists
        });
      }
    });

    // method to compare a given password with the database hash
    this.methods.comparePassword = function(password) {
      return bcrypt.compareSync(password, this.password);
    }

    this.methods.asJson = function() {
      return {
        _id: this._id,
        email: this.email,
        firstname: this.firstname,
        lastname: this.lastname,
        picture: this.picture
      }
    }

    this.statics.activateAccount = function(token, callback) {
      // Activate account and change token
      let new_token = shortid.generate();
      this.findOneAndUpdate({
        activation_token: token,
        active: false
      }, {
        active: true,
        activation_token: new_token
      }, {
        select: "active",
        new: true
      }, (err, user) => {
        callback(err, user);
      });
    };

  }
}

module.exports = mongoose.model('User', new User());