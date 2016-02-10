var fs = require("fs");

function remove(req, res, next){
	res.on('finish', function(){
    	for(var fieldname in req.files) {
			if (req.files.hasOwnProperty(fieldname)) {
				var file = req.files[fieldname]
		    	if (!file.pending) {
					fs.unlink(file.path);
				}
			}
		}
  	});

  	next();
}

exports.remove = remove;
