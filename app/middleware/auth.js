const util = require('util')
const jwt = require("jsonwebtoken");
const errors = require("../helpers/errors");
const User = require("../models/user");
const verify = util.promisify(jwt.verify)

module.exports = (...roles) => async (req, res, next) => {
  let token = req.headers["x-access-token"]
  if (token) {
    try {
      const decoded = await verify(token, process.env.SECRET)
      const user = await User.findOne({
        _id: decoded._id,
        email: decoded.email,
        active: true
      }, '+password')
      req.current_user = user

      // check user role
      if (roles && roles.length && !roles.includes(user.role)) {
        return res.status(401).send(errors.newError(errors.errorsEnum.InvalidRole))
      }
      return next()
    }
    catch (err) {
      return res.status(403).send(errors.newError(errors.errorsEnum.AuthToken, err))
    }
  } else {
    return res.status(403).send(errors.newError(errors.errorsEnum.NoTokenProvided))
  }
}
// middleware to authenticate routes
