process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var config = require('../config').config();
var async = require("async");

var factories = require('./factories');

var database = (process.env.TEST_DB || config.database);
var mongooseUri = uriUtil.formatMongoose(database);

before(function (done) {

  function cleanDB() {
    // Remove all database documents and indexes
    async.each(mongoose.connection.collections, function(collection, callback) {
      collection.remove(function(){
        collection.dropIndexes(callback);
      });
    }, function(err){
      async.each(mongoose.connection.models, function(model, callback) {
        // Re-generate indexes
        model.ensureIndexes(callback);
      }, function(err){
        // Register factories
        factories.register();
        // Run tests
        done();
      });
    });
  }

  // Connect to mongo and clean test database
  mongoose.connect(mongooseUri, function() {
    cleanDB();
  });
});

after(function (done) {
  mongoose.disconnect();
  return done();
});