const EventEmitter = require('events').EventEmitter;
const idGenerator = require('./idGenerator');

class BaseQueryService extends EventEmitter {
  constructor(collection, options) {
    super();
    this._collection = collection;
    this._options = options || {};
  }

  /**
  * @return {string} name of the colleciton
  **/
  get name() {
    return this._collection.collectionName;
  }

  /**
  * Works as find, but also return paged results if page > 0
  * More documentation: https://automattic.github.io/monk/docs/collection/find.html
  *
  * @param query {string} mongo search query
  * @param opt.perPage {Number} number of items to return per page
  * @param opt.page {Number} a page number to return
  *
  * @return {pagesCount, results, count} {Object} - number of pages,
  * list of items and total count of all matched items
  */
  find(query = {}, opt = { perPage: 100, page: 0 }) {
    const options = opt;
    const hasPaging = options.page > 0;
    if (hasPaging) {
      options.skip = (options.page - 1) * options.perPage;
      options.limit = options.perPage;
    }

    return this._collection.find(query, options)
      .then((results) => {
        if (!hasPaging) {
          return {
            results,
          };
        }

        return this._collection.count(query)
          .then((count) => {
            const pagesCount = Math.ceil(count / options.perPage) || 1;
            return {
              pagesCount,
              results,
              count,
            };
          });
      });
  }

  /**
  * Finds one document, if multiple returned - throws an error
  *
  * @param query {Object} - search query
  * @param options {Object} - search options, such fields and others
  *
  * @return {Object} - returns a document from the database
  **/
  findOne(query = {}, options = {}) {
    return this.find(query, options)
      .then((data) => {
        if (data.results.length > 1) {
          throw new Error(`findOne: More than one document return for query ${query}`);
        }
        return data.results.length === 1 ? data.results[0] : null;
      });
  }

  /**
  * Count documents by query
  *
  * @param query {Object} - search query
  * @return {Number} - number of documents matched by query
  **/
  count(query) {
    return this._collection.count(query);
  }

  /**
  * Checks if document exists by specified query
  *
  * @param query {string} - search query
  * @return {Boolean}
  **/
  exists(query) {
    return this.count(query)
      .then((count) => count > 0);
  }

  /**
  * Run mongodb aggregation query
  * More documentation: https://docs.mongodb.com/manual/meta/aggregation-quick-reference
  *
  * @param pipeline {Array} - aggregation pipeline
  * @return {Object} - aggregation result
  **/
  aggregate(pipeline) {
    return this._collection.aggregate(pipeline);
  }

  /**
  * Generates mongodb id string
  **/
  generateId() {
    return idGenerator.generate();
  }
}

module.exports = BaseQueryService;
