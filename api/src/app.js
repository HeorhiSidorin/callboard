require('app-module-path').addPath(__dirname);
global.logger = require('./logger');

const config = require('./config');

const logger = global.logger;

const app = require('koa')();
require('./config/koa')(app);

app.listen(config.port, null, () => {
  logger.info(`api is listening on ${config.port}, in ${config.env} mode`);
});

module.exports = app;
