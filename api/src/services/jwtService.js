const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('logger');

exports.getJwt = (payload, expirationTime) =>
  jwt.sign(payload, config.privateKey, { expiresIn: expirationTime });

exports.verifyJwt = (jwtToken) => {
  let res;
  try {
    res = jwt.verify(jwtToken, config.privateKey);
  } catch (err) {
    logger.warn('Invalid json web token', err);
  }
  return res;
};
