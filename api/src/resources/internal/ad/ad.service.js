const db = require('db');
const service = db.createService('ads');

// Service is stateless and created once, just add any methods you need here
// for example: service.signup = () => {};
module.exports = service;
