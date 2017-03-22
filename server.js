const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const morgan = require("morgan");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("./config").config();
const path = require("path");
const routes = require("./app/routes/routes");
const attachments = require("./app/middleware/attachments");

// ---- APP CONFIGURATION ----

// log all requests to the console
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: config.uploads_dir }));

// handle CORS requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,x-access-token");

  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
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

// Application routes
app.use('/api', routes.get());

// ---- MAIN CATCHALL ROUTE - SEND USERS TO FRONTEND ----
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/app/views/index.html"));
});

// ---- START SERVER ----
let port = process.env.PORT || 8085;
let server = app.listen(port, () => {
  if (process.env.NODE_ENV !== 'test') console.log("Server running on port " + port);
});

module.exports = server;
