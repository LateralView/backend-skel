var fs = require("fs");

function remove(req, res, next){
  res.on('finish', function(){
    for(var fieldname in req.files) {
      var file = req.files[fieldname]
      if (!file.pending) {
        fs.unlink('./' + file.path);
        console.log(file.path + " deleted");
      }
    }
  });
  next();
}

exports.remove = remove;
