const winston = require('winston');

module.exports.configure = function configure(isDev = false) {
  const transports = [
    new (winston.transports.Console)({
      colorize: true,
      json: !isDev,
      level: isDev ? 'debug' : 'info',
    }),
  ];

  const logger = new (winston.Logger)({
    exitOnError: false,
    transports,
  });

  return logger;
};
