process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var config = require('../config').config();
var async = require("async");

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
    mongoose.connect(config.database, function (err) {
      if (err)
        throw err;
      return clearDB();
    });
  } else
      return clearDB();

});

after(function (done) {
  mongoose.disconnect();
  return done();
});