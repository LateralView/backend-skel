const fs = require("fs");

class AttachmentMiddleware {
  remove(req, res, next) {
    res.on('finish', () => {
      for (let fieldname in req.files) {
        if (req.files.hasOwnProperty(fieldname)) {
          let file = req.files[fieldname]
          if (!file.pending) {
            fs.unlink(file.path);
          }
        }
      }
    });
    next();
  }
}

module.exports = new AttachmentMiddleware();