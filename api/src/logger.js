const config = require('config');
const LoggerFactory = require('lib/logger');

module.exports = LoggerFactory.configure(config.isDev);
