import PocketBase from 'pocketbase';

/**
 * @typedef {Object} CrudOptions
 * @property {string} url
 * @property {any} [authStore]
 */

/**
 * @typedef {Object} QueryOptions
 * @property {string} [filter]
 * @property {string} [sort]
 * @property {number} [page]
 * @property {number} [perPage]
 * @property {string} [expand]
 */

/**
 * @typedef {Object} CollectionField
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {boolean} system
 * @property {boolean} required
 * @property {boolean} presentable
 * @property {boolean} [unique]
 * @property {Object} [options]
 * @property {number} [options.min]
 * @property {number} [options.max]
 * @property {string} [options.pattern]
 * @property {string[]} [options.values]
 * @property {number} [options.maxSelect]
 * @property {boolean} [options.cascadeDelete]
 * @property {number} [options.minSelect]
 * @property {string[]} [options.displayFields]
 * @property {string} [options.collectionId]
 */

/**
 * @typedef {Object} CollectionSchema
 * @property {string} id
 * @property {string} name
 * @property {'base' | 'auth' | 'view'} type
 * @property {boolean} system
 * @property {CollectionField[]} schema
 * @property {string[]} indexes
 * @property {string | null} [listRule]
 * @property {string | null} [viewRule]
 * @property {string | null} [createRule]
 * @property {string | null} [updateRule]
 * @property {string | null} [deleteRule]
 * @property {Record<string, any> | null} [options]
 */

export class PocketCrud {
  /**
   * @private
   * @type {PocketBase}
   */
  pb;

  /**
   * @param {CrudOptions} options
   */
  constructor(options) {
    this.pb = new PocketBase(options.url);
    if (options.authStore) {
      this.pb.authStore = options.authStore;
    }
  }

  /**
   * @template {Record<string, any>} T
   * @param {string} collection
   * @param {Record<string, any>} data
   * @returns {Promise<T>}
   */
  async create(collection, data) {
    return this.pb.collection(collection).create(data);
  }

  /**
   * @template {Record<string, any>} T
   * @param {string} collection
   * @param {string} id
   * @param {Pick<QueryOptions, 'expand'>} [options]
   * @returns {Promise<T>}
   */
  async getOne(collection, id, options) {
    return this.pb.collection(collection).getOne(id, options);
  }

  /**
   * @template {Record<string, any>} T
   * @param {string} collection
   * @param {QueryOptions} [options]
   */
  async getList(collection, options) {
    const { page = 1, perPage = 30, ...restOptions } = options || {};
    return this.pb.collection(collection).getList(page, perPage, restOptions);
  }

  /**
   * @template {Record<string, any>} T
   * @param {string} collection
   * @param {Omit<QueryOptions, 'page' | 'perPage'>} [options]
   */
  async getFullList(collection, options) {
    return this.pb.collection(collection).getFullList(options);
  }

  /**
   * @template {Record<string, any>} T
   * @param {string} collection
   * @param {string} id
   * @param {Record<string, any>} data
   * @returns {Promise<T>}
   */
  async update(collection, id, data) {
    return this.pb.collection(collection).update(id, data);
  }

  /**
   * @param {string} collection
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(collection, id) {
    return this.pb.collection(collection).delete(id);
  }

  /**
   * @returns {Promise<CollectionSchema[]>}
   */
  async getCollections() {
    try {
      // Try admin method first
      const collections = await this.pb.collections.getFullList();
      return collections.map(col => ({
        id: col.id,
        name: col.name,
        type: /** @type {'base' | 'auth' | 'view'} */ (col.type),
        system: col.system,
        schema: (col.schema || []).map(field => ({
          id: field.id,
          name: field.name,
          type: field.type,
          system: field.system,
          required: field.required,
          presentable: field.presentable,
          unique: field.unique || false,
          options: field.options,
        })),
        indexes: col.indexes || [],
        listRule: col.listRule,
        viewRule: col.viewRule,
        createRule: col.createRule,
        updateRule: col.updateRule,
        deleteRule: col.deleteRule,
        options: col.options,
      }));
    } catch {
      // If admin method fails, fallback to discovering accessible collections
      return this.getAccessibleCollections();
    }
  }

  /**
   * @returns {Promise<CollectionSchema[]>}
   */
  async getAccessibleCollections() {
    // List of known collections to try
    const knownCollections = [
      'posts',
      'users',
      'comments',
      'categories',
      'pages',
      'media',
      'settings',
    ];
    /** @type {CollectionSchema[]} */
    const accessibleCollections = [];

    for (const collectionName of knownCollections) {
      try {
        // Try to access the collection to see if we have permissions
        await this.pb.collection(collectionName).getList(1, 1);

        // If successful, try to get the collection schema
        try {
          const collection = await this.pb.collections.getOne(collectionName);
          accessibleCollections.push({
            id: collection.id,
            name: collection.name,
            type: /** @type {'base' | 'auth' | 'view'} */ (collection.type),
            system: collection.system || false,
            schema: (collection.schema || []).map(field => ({
              id: field.id,
              name: field.name,
              type: field.type,
              system: field.system,
              required: field.required,
              presentable: field.presentable,
              unique: field.unique || false,
              options: field.options,
            })),
            indexes: collection.indexes || [],
            listRule: collection.listRule,
            viewRule: collection.viewRule,
            createRule: collection.createRule,
            updateRule: collection.updateRule,
            deleteRule: collection.deleteRule,
            options: collection.options,
          });
        } catch {
          // If we can't get schema, create a basic collection entry
          accessibleCollections.push({
            id: collectionName,
            name: collectionName,
            type: 'base',
            system: false,
            schema: [],
            indexes: [],
            listRule: null,
            viewRule: null,
            createRule: null,
            updateRule: null,
            deleteRule: null,
            options: null,
          });
        }
      } catch {
        // Collection not accessible, skip it
        continue;
      }
    }

    return accessibleCollections;
  }

  /**
   * @param {string} idOrName
   * @returns {Promise<CollectionSchema>}
   */
  async getCollection(idOrName) {
    const collection = await this.pb.collections.getOne(idOrName);
    return {
      id: collection.id,
      name: collection.name,
      type: /** @type {'base' | 'auth' | 'view'} */ (collection.type),
      system: collection.system,
      schema: (collection.schema || []).map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        system: field.system,
        required: field.required,
        presentable: field.presentable,
        unique: field.unique,
        options: field.options,
      })),
      indexes: collection.indexes || [],
      listRule: collection.listRule,
      viewRule: collection.viewRule,
      createRule: collection.createRule,
      updateRule: collection.updateRule,
      deleteRule: collection.deleteRule,
      options: collection.options,
    };
  }

  /**
   * @param {string} idOrName
   * @returns {Promise<CollectionField[]>}
   */
  async getCollectionSchema(idOrName) {
    const collection = await this.getCollection(idOrName);
    return collection.schema;
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{id: string, email: string, created: string, updated: string}>}
   */
  async createAdmin(email, password) {
    return this.pb.admins.create({
      email,
      password,
      passwordConfirm: password,
    });
  }

  /**
   * @returns {Promise<boolean>}
   */
  async isAdminUser() {
    try {
      // Try to access admin-only functionality
      await this.pb.collections.getList(1, 1);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @returns {PocketBase}
   */
  get client() {
    return this.pb;
  }
}

export * from './form-utils.js';
export default PocketCrud;
