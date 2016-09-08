const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');

module.exports = function configureKoa(app) {
  app.use(cors());
  app.use(bodyParser());
  require('koa-validate')(app);

  app.use(function * handleGlobalErrors(next) {
    try {
      yield next;
    } catch (err) {
      console.error(err);
      this.status = err.status || 500;
      this.body = {
        errors: [{ _global: 'An error has occurred' }],
      };
      this.app.emit('error', err, this);
    }
  });

  require('./routes')(app);
};
