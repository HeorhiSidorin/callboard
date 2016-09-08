const mount = require('koa-mount');
const adResource = require('resources/internal/ad');

module.exports = function exportRoutes(app) {
  app.use(mount('/internal/ad', adResource));
};
