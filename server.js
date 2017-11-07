if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: `${__dirname}/.env.test` })
}
else {
  require('dotenv').config()
}
const cors = require('cors')
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const routes = require("./app/routes/routes");
const attachments = require("./app/middleware/attachments");

// ---- APP CONFIGURATION ----

// log all requests to the console
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan("dev"));
}

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: process.env.UPLOADS_DIR }));

// database connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.DATABASE);
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
  if (process.env.NODE_ENV !== 'test'){
    //eslint-disable-next-line no-console
    console.log("Server running on port " + port);
  }
});

module.exports = server;
