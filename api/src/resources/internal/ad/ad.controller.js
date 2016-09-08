const adService = require('./ad.service');

exports.all = function * () {
  const allAds = yield adService.find({});
  this.body = allAds;
};
