const userService = require('resources/internal/user/user.service');
const companyService = require('resources/internal/company/company.service');
const appService = require('resources/internal/app/app.service');
const securityUtil = require('lib/utils/security');
const co = require('co');

const createDefaultComapany = (company) => {
  const result = companyService.findOne({ _id: company._id })
    .then((data) => {
      if (data) {
        throw new Error('Company already registered');
      }
      return companyService.create(company);
    });
  return result;
};

const createDefaultApp = (app) => {
  const result = appService.findOne({ _id: app._id })
    .then(() => appService.create({
      name: app.name,
      companyId: app.companyId,
      _id: app._id,
    }));
  return result;
};

const createDefaultUser = (user) => {
  const password = 'kf2xYJrk';
  return userService.findOne({ _id: user._id })
    .then((data) => {
      if (data) {
        throw new Error('User already registered');
      }
    })
    .then(() => co(function * () {
      const salt = yield securityUtil.generateSalt();
      const hash = yield securityUtil.getHash(password, salt);
      return { salt, hash };
    }))
    .then(({ salt, hash }) => {
      const result = userService.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordHash: hash,
        passwordSalt: salt,
        companyId: user.companyId,
        status: user.status,
        appId: user.appId,
        _id: user._id,
      });
      return result;
    });
};


module.exports.setupDefaultCompany = () => {
  const companyId = '57a1bfdbdee29620b21631fc';
  const userId = '57a1c045df7dda20e8ceb488';
  const appId = '57a1c0c5dac4c62126f0a6b5';
  const company = {
    _id: companyId,
    name: 'Magpie',
    status: 'active',
  };
  const user = {
    _id: userId,
    firstName: 'Andrew',
    lastName: 'Orsich',
    email: 'andrew@paralect.com',
    status: 'active',
  };
  return createDefaultComapany(company)
    .then((data) => {
      const defaultApp = createDefaultApp({
        companyId: data._id,
        name: data.name,
        _id: appId,
      });
      return defaultApp;
    })
    .then((result) => {
      const defaultUser = createDefaultUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId,
        status: user.status,
        appId: result._id,
        _id: userId,
      });
      return defaultUser;
    })
    .catch(err => err);
};
