const protocol = 'http://';

module.exports = {
  protocol,
  apiUrl: `${protocol}localhost:8081`,
  mongo: {
    connection: 'mongodb://localhost:27017/callboard',
  },
};
