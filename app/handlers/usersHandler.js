var jwt = require("jsonwebtoken"),
  config = require("../../config").config(),
  User = require("../models/user");

var secret_token = config.secret;

function authenticate(req, res){
  User
    .findOne({ email: req.body.email })
    .select("email password active")
    .exec(function(err, user){
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: "Login failed",
              errors: { user: { message: "Invalid Credentials."  } } });
      } else {
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({ success: false, message: "Login failed",
              errors: { user: { message: "Invalid Credentials."  } } });
        } else {
          // Check if user is active
          if (!user.active) {
            res.json({ success: false, message: "Login failed",
              errors: { user: { message: "Please activate your account."  } } });
          } else {
            var token = jwt.sign({
              _id: user._id,
              email: user.email
            }, secret_token, { expiresInMinutes: 1440 });

            res.json({
              success: true,
              token:  token,
              user: {
                _id: user._id,
                email: user.email
              }
            });
          }
        }
      }
    });
}

function createUser(req, res){
  var user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  user.save(function(err){
    if (err) {
      // duplicate entry
      if (err.code == 11000)
        return res.json({ success: false, message: "User validation failed",
                  errors: { email: { message: "A user with that email already exists."  } } });
      else
        return res.send(err);
    }
    res.json({ message: "User created!" });
  });
}

function updateCurrentUser(req, res) {
  var user = req.current_user;
  if (req.body.password && req.body.new_password) {
    // Check current password
    var validPassword = user.comparePassword(req.body.password);
    if (!validPassword) {
      return res.json({
        success: false, message: "User validation failed", errors: { password: { message: "Current password is invalid." }}});
    }

    user.password = req.body.new_password;
  }

  user.save(function(err){
    if (err) return res.send(err);
    res.json({ message: "User updated!" });
  });
}

exports.authenticate = authenticate;
exports.createUser = createUser;
exports.updateCurrentUser = updateCurrentUser;
