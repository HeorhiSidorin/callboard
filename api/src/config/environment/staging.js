const url = '???';
const protocol = 'http://';

module.exports = {
  protocol,
  apiUrl: `${protocol}api.${url}`,
  mongo: {
    connection: `mongodb://${url}/callboard`,
  },
};
