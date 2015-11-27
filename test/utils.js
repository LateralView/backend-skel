process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var config = require('../config').config();
var async = require("async");

var database = (process.env.TEST_DB || config.database)

before(function (done) {

  function clearDB() {
    async.each(mongoose.connection.collections, function(collection, callback) {
      collection.remove(function() {
        callback();
      });
    }, function(err){
      if(err)
        throw err;
      else
        return done();
    });
  }

  if (mongoose.connection.readyState === 0) {
    var mongooseUri = uriUtil.formatMongoose(database);
    mongoose.connect(mongooseUri);
    var conn = mongoose.connection;

    conn.once('open', function() {
      return clearDB();
    });
  } else
      return clearDB();

});

after(function (done) {
  mongoose.disconnect();
  return done();
});