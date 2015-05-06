var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  multer = require("multer"),
  morgan = require("morgan"),
  mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  config = require("./config"),
  path = require("path"),
  routes = require("./app/routes/routes"),
  attachments = require("./app/middleware/attachments");

// ---- APP CONFIGURATION ----

app.use(bodyParser.json());
app.use(multer({ dest: './uploads/' }));


// handle CORS requests
app.use(function(req, res, next){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
  next();
})

// log all requests to the console
app.use(morgan("dev"));

// remove attachments when request finishes
app.use(attachments.remove);

// database connection
mongoose.connect(config.database.development);

// set static files location
app.use(express.static(__dirname + "/public"));

// Request Handlers
var handlers = {
  users: require('./app/handlers/usersHandler')
};

// Application routes
routes.setup(app, handlers);

// ---- MAIN CATCHALL ROUTE - SEND USERS TO FRONTEND ----
app.get("*", function(req, res){
  res.sendFile(path.join(__dirname + "/public/app/views/index.html"));
});

// ---- START SERVER ----
app.listen(config.port);
console.log("Server running on port " + config.port);
