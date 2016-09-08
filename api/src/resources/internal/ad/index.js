const controller = require('./ad.controller');
const router = require('koa-router')();


router.get('/all', controller.all);

module.exports = router.routes();
