const config = require('./config');
const db = require('lib/mongo')(config.mongo.connection);

module.exports = db;
