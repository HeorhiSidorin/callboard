/**
 *  Validate request and send 400(bad request), when request is not valid
 *
 * @param koaCtx {Object} - a koa context
 */
module.exports = function * valiateRequest(koaCtx, validateFn) {
  const koa = koaCtx;
  koa.errors = [];
  let data = yield validateFn(koa);
  if (!data) {
    data = {};
  }
  data.isValid = koa.errors.length === 0;
  if (!data.isValid) {
    koa.body = { errors: koa.errors };
    koa.status = 400;
  }

  return data;
};
