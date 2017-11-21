const express = require("express");
const token_authentication = require("../middleware/auth");
const handlers = require('../handlers');
const { ROLES } = require('../models/const/roles')

class Routes {

  constructor() {
    this.appRoutes = express.Router();

    // ########## Authentication Route ##########
    this.appRoutes.post('/users/authenticate', handlers.users.authenticate)

    // ############## Users Routes ##############
    // Register new user
    this.appRoutes.post('/users', handlers.users.createUser);

    // Activate registered user
    this.appRoutes.post('/users/activate', handlers.users.activateAccount);

    // Update current user
    this.appRoutes.put('/user', token_authentication(), handlers.users.updateCurrentUser);

    // Get users
    this.appRoutes.get('/users', token_authentication(ROLES.ADMIN), handlers.users.all);
  }

  get() {
    return this.appRoutes;
  }
}

module.exports = new Routes();
