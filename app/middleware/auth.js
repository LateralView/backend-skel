const jwt = require("jsonwebtoken");
const	errors = require("../helpers/errors");
const	User = require("../models/user");

class AuthMiddleware {
  middleware(req, res, next) {
    let token = req.headers["x-access-token"];
    if (token) {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send(errors.newError(errors.errorsEnum.AuthToken, err));
        }
        else {
          // Get user
          User.findOne({ _id: decoded._id, email: decoded.email, active: true })
            .select("+password")
            .exec((err, user) => {
            if (err || !user) {
              return res.status(403).send(errors.newError(errors.errorsEnum.AuthToken, err ? err : {}));
            }
            else {
              req.current_user = user;
              next();
            }
          });
        }
      })
    }
    else {
      return res.status(403).send(errors.newError(errors.errorsEnum.NoTokenProvided));
    }
  }
}

authMiddleware = new AuthMiddleware();
module.exports = authMiddleware.middleware;

// middleware to authenticate routes
