require('dotenv').config({ path: `${__dirname}/../.env.test` })
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const asyncLib = require("async");

const factories = require('./factories');
const database = (process.env.TEST_DB || process.env.DATABASE);
const mongooseUri = uriUtil.formatMongoose(database);

before((done) => {

  const cleanDB = () => {
    // Remove all database documents and indexes
    asyncLib.each(mongoose.connection.collections, (collection, callback) => {
      collection.dropIndexes(callback);
    }, () => {
      asyncLib.each(mongoose.connection.models, (model, callback) => {
        // Re-generate indexes
        model.ensureIndexes(callback);
      }, () => {
        asyncLib.each(mongoose.connection.collections, (collection, callback) => {
          collection.remove(callback);
        }, () => {
          // Register factories
          factories.register();
          // Run tests
          done();
        });
      });
    });
  }

  // Connect to mongo and clean test database
  mongoose.connect(mongooseUri, { useMongoClient: true }, () => {
    // Clean DB and regenerate indexes
    cleanDB();
  });
});

after((done) => {
  mongoose.disconnect();
  return done();
});
