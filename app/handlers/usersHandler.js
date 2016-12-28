var jwt = require("jsonwebtoken"),
  config = require("../../config").config(),
  errors = require("../helpers/errors"),
  User = require("../models/user");

var secret_token = config.secret;

/**
 * @api {post} /api/users/authenticate Authenticate user
 * @apiName authenticate
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      token:  "12345abcdef",
 *      user: {
 *        _id: user._id,
 *        email: "user@example.com",
 *        firstname: "John",
 *        lastname: "Doe"
 *      }
 *    }
 *
 * @apiError LoginInvalidCredentials Invalid credentials
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      code: 1000100,
 *      message: "Invalid credentials.",
 *      detail: {},
 *      errors: []
 *    }
 *
 *
 * @apiError CantAuthenticateUser There was a problem on authenticate user
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      code: 1000101,
 *      message: "There was a problem on authenticate user.",
 *      detail: {},
 *      errors: []
 *    }
 *
 * @apiError AccountNotActive Please activate your account
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      code: 1000102,
 *      message: "Please activate your account.",
 *      detail: {},
 *      errors: []
 *    }
 */
function authenticate(req, res){
  User
    .findOne({ email: req.body.email })
    .select("+password +active")
    .exec(function(err, user){
      if (err){
        return res.status(400).send(errors.newError(errors.errorsEnum.CantAuthenticateUser, err))
      }
      if (!user) {
        res.status(401).json(errors.newError(errors.errorsEnum.LoginInvalidCredentials));
      } else {
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.status(401).json(errors.newError(errors.errorsEnum.LoginInvalidCredentials));
        } else {
          // Check if user is active
          if (!user.active) {
            res.status(401).json(errors.newError(errors.errorsEnum.AccountNotActive));
          } else {
            var token = jwt.sign({
              _id: user._id,
              email: user.email
            }, secret_token, { expiresIn: 86400 }); // 86400 seconds = 1 day
            res.json({
              token:  token,
              user: user.asJson()
            });
          }
        }
      }
    });
}

/**
 * @api {post} /api/users Register new user
 * @apiName user_create
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 * @apiParam {String} firstname User firstname
 * @apiParam {String} lastname User lastname
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 201 Created
 *    {
 *      token:  "12345abcdef",
 *      user: {
 *        _id: user._id,
 *        email: "user@example.com",
 *        firstname: "John",
 *        lastname: "Doe"
 *      }
 *    }
 *
 *
 * @apiError CantCreateUser Can't create new user
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      code: 1000000,
 *      message: "Can't create new user.",
 *      detail: {},
 *      errors: []
 *    }
 *
 *
 * @apiError UserEmailAlreadyUsed A user with that email already exists
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 409 Conflict
 *    {
 *      code: 1000001,
 *      message: "A user with that email already exists.",
 *      detail: {},
 *      errors: ['email']
 *    }
 */
function createUser(req, res){
  var user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;

  user.save(function(err){
    if (err) {
      if (err.code === 11000)
        return res.status(409).json(errors.newError(errors.errorsEnum.UserEmailAlreadyUsed, err, ['email']));
      else
        return res.status(400).json(errors.newError(errors.errorsEnum.CantCreateUser, err));
    }
    
    res.status(201).json({
      message: "User created!",
      user: user.asJson()
    });
  });
}

/**
 * @api {put} /api/user Update user
 * @apiName user_update
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiHeader {String} x-access-token Users unique access token
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 * @apiParam {String} firstname User firstname
 * @apiParam {String} lastname User lastname
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      message:  "User updated!",
 *      user: {
 *        _id: user._id,
 *        email: "user@example.com",
 *        firstname: "John",
 *        lastname: "Doe"
 *      }
 *    }
 *
 * @apiError CantEditUser Can't edit user
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      code: 1000200,
 *      message: "Can't edit user.",
 *      detail: {},
 *      errors: []
 *    }
 *
 *
 * @apiError CantEditPassword Current password is invalid
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      code: 1000201,
 *      message: "Current password is invalid.",
 *      detail: {},
 *      errors: ['password']
 *    }
 */
function updateCurrentUser(req, res) {
  var user = req.current_user;
  if(req.files.picture) {
    user.picture = {
      url: null,
      path: null,
      original_file: req.files.picture
    };
  }
  if (req.body.password && req.body.new_password) {
    // Check current password
    var validPassword = user.comparePassword(req.body.password);
    if (!validPassword) {
      return res.status(400).json(errors.newError(errors.errorsEnum.CantEditPassword, {}, ['password']));
    }

    user.password = req.body.new_password;
  }

  if (req.body.firstname ){
    user.firstname = req.body.firstname
  }

  if (req.body.lastname ){
    user.lastname = req.body.lastname
  }

  user.save(function(err, updatedUser){
    if (err) return res.status(400).send(errors.newError(errors.errorsEnum.CantEditUser, err));
    res.json({
      message: "User updated!",
      user: updatedUser.asJson()
    });
  });
}

/**
 * @api {post} /api/users/activate Activate user
 * @apiName user_activate
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiParam {String} activation_token Activation token
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      message:  "Account activated."
 *    }
 *
 * @apiError CantActivateAccount There was a problem at activate account
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      code: 1000300,
 *      message: "There was a problem at activate account.",
 *      detail: {},
 *      errors: []
 *    }
 *
 * @apiError InvalidToken Invalid token
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      code: 1000301,
 *      message: "Invalid token.",
 *      detail: {},
 *      errors: ['activation_token']
 *    }
 */
function activateAccount(req, res) {
  User.activateAccount(req.body.activation_token, function(err, user) {
    if (err)
      return res.status(400).send(errors.newError(errors.errorsEnum.CantActivateAccount, err));
    else if(!user)
      return res.status(400).json(errors.newError(errors.errorsEnum.InvalidToken, {}, ['activation_token']));
    
    res.json({
      message: "Account activated."
    });
  });
}

exports.authenticate = authenticate;
exports.createUser = createUser;
exports.updateCurrentUser = updateCurrentUser;
exports.activateAccount = activateAccount;
