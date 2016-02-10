var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  morgan = require("morgan"),
  mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  config = require("./config").config(),
  path = require("path"),
  routes = require("./app/routes/routes"),
  attachments = require("./app/middleware/attachments");

// ---- APP CONFIGURATION ----

// log all requests to the console
if (process.env.NODE_ENV !== 'test')
  app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(multer({ dest: config.uploads_dir }));

// handle CORS requests
app.use(function(req, res, next){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,x-access-token");

  if ('OPTIONS' === req.method)
    res.send(200);
  else
    next();
})

// database connection
if (!mongoose.connection.readyState) {
  mongoose.connect(config.database);
  mongoose.set('debug', (!process.env.NODE_ENV || process.env.NODE_ENV === 'development'));
}

// apidoc route
app.use('/apidoc', express.static(path.join(__dirname, '/apidoc')));

// remove attachments when request finishes
app.use(attachments.remove);

// set static files location
app.use(express.static(path.join(__dirname, "/public")));

// Request Handlers
var handlers = {
  users: require('./app/handlers/usersHandler')
};

// Application routes
routes.setup(app, handlers);

// ---- MAIN CATCHALL ROUTE - SEND USERS TO FRONTEND ----
app.get("*", function(req, res){
  res.sendFile(path.join(__dirname, "/public/app/views/index.html"));
});

// ---- START SERVER ----
var port = process.env.PORT || 8085;
var server = app.listen(port, function(){
  if (process.env.NODE_ENV !== 'test') console.log("Server running on port " + port);
});

module.exports = server;