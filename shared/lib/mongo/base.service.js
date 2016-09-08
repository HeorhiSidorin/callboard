const _ = require('lodash');
const BaseQueryService = require('./baseQuery.service');
const idGenerator = require('./idGenerator');

class BaseService extends BaseQueryService {
  constructor(collection, options) {
    super(collection, options || {});

    this.logger = global.logger;
  }

  _validateSchema(entity) {
    if (this._options.validateSchema) {
      const validationResult = this._options.validateSchema(entity);
      if (validationResult.errors && validationResult.errors.length > 0) {
        console.error('Schema invalid', JSON.stringify(validationResult.errors, 0, 4));
        throw new Error(`Document schema is invalid: ${JSON.stringify(validationResult.errors)}`);
      }
    }
  }

  /**
  * Insert one object or array of the objects to the database
  * Publishes `created` event {doc}
  * Sets createdOn to the current date
  *
  * @param {array | object} Object or array of objects to create
  * @return {array | object} Object or array of created objects
  **/
  create(objs) {
    let entities = objs;
    if (!_.isArray(entities)) {
      entities = [entities];
    }

    entities.forEach((item) => {
      const entity = item;
      if (!entity._id) {
        entity._id = idGenerator.generate();
      }
      entity.createdOn = new Date();

      this._validateSchema(entity);
    });

    return this._collection.insert(entities)
      .then(() => {
        entities.forEach((doc) => {
          this.emit('created', {
            doc,
          });
        });

        return entities.length > 1 ? entities : entities[0];
      });
  }

  generateId() {
    return idGenerator.generate();
  }

  /**
  * Modifies entity found by query in the database
  * Publishes `updated` event {doc, prevDoc}
  * Sets updatedOn to the current date
  *
  * @param query {Object} - mongo search query
  * @param updateFn {function(doc)} - function, that recieves document to be updated
  * @param options {Object} - mongodb update options (http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#update)
  * @return {Object} Updated object
  **/
  update(query, updateFn, options) {
    return this.findOne(query, options)
      .then((d) => {
        let doc = d;
        if (!d) {
          throw new Error(`Document not found while updating. Query: ${JSON.stringify(query)}`);
        }
        const prevDoc = _.cloneDeep(doc);
        doc.updatedOn = new Date();
        let update;
        if ( _.isFunction(updateFn) ) {
          updateFn(doc);
          this._validateSchema(doc);
          update = this._collection.update({ _id: doc._id }, doc);
        } else {
          update = this._collection.update(query, updateFn);
          const docId = doc._id;
          doc = update.then(() => this.findOne({ _id: docId }));
        }
        return Promise.all([
          update,
          doc,
          prevDoc,
        ]);
      })
      .then((data) => {
        this.emit('updated', {
          doc: data[1],
          prevDoc: data[2],
        });

        return data[1];
      });
  }

  updateAll(query, update, options) {
    return this._collection.update(query, update, { multi: true })
    .then(() => {
      return this._collection.find(query)
    })
    .then((data) => {
      this.emit('updatedAll', {
        data,
      });

      return data;
    });
  }

  /**
  * Remove one or many documents found by query
  *
  * @param query {Object} - mongodb search query
  **/
  remove(query) {
    let removed;
    return this.find(query)
    .then((docsForRemove) => (
      removed = docsForRemove
    ))
    .then(this._collection.remove(query))
    .then(() => {
      this.emit('removed', {
        docs: removed.result,
      });
    });
  }

  /**
  * Create or check index existence, omits error
  *
  * @param index {Object} - index to be created
  * @param options {Object} - index options
  */
  ensureIndex(index, options) {
    return this._collection.ensureIndex(index, options)
      .catch((err) => {
        this.logger.warn(err);
      });
  }

  /**
   * Use only to update denormalized data,
   * this method does not emit reactive events (created, updated)
   * to avoid circular updateAsync
   *
   * @param query {Object} - mongo search query
   * @param updateFn {function(doc)} - function, that recieves document to be updated
   * @param options {Object} - mongodb update options (http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#update)
   **/
  atomicUpdate(query, update, options = {}) {
    return this._collection.update(query, update, options);
  }

  createOrUpdate(query, updateFn) {
    return this.exists(query)
      .then((exists) => {
        if (exists) {
          return this.update(query, updateFn);
        }
        const user = query;
        updateFn(user);
        return this.create(user);
      });
  }
}

module.exports = BaseService;
