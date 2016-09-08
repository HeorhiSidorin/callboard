const _ = require('lodash');

const env = process.env.NODE_ENV || 'development';

let base = {
  env,
  port: 8081,
  isDev: env === 'development',
};

const envConfig = require(`./${env}.js`);
base = _.merge(base, envConfig || {});

module.exports = base;
