import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PocketCrud } from './crud.js';

// Mock PocketBase
const mockPocketBase = {
  collections: {
    getFullList: vi.fn(),
    getOne: vi.fn(),
  },
  collection: vi.fn(),
  baseUrl: 'http://localhost:8090',
  authStore: {},
};

vi.mock('pocketbase', () => ({
  default: vi.fn(() => mockPocketBase),
}));

describe('PocketCrud', () => {
  /** @type {PocketCrud} */
  let crud;

  beforeEach(() => {
    vi.clearAllMocks();
    crud = new PocketCrud({ url: 'http://localhost:8090' });
  });

  describe('constructor', () => {
    it('should create instance with URL', () => {
      expect(crud).toBeDefined();
      expect(crud.client).toBe(mockPocketBase);
    });

    it('should accept auth store option', () => {
      const customAuthStore = { token: 'test' };
      const crudWithAuth = new PocketCrud({
        url: 'http://localhost:8090',
        authStore: customAuthStore,
      });
      expect(crudWithAuth.client.authStore).toBe(customAuthStore);
    });
  });

  describe('getCollections', () => {
    it('should return formatted collections', async () => {
      const mockCollections = [
        {
          id: 'col1',
          name: 'users',
          type: 'auth',
          system: false,
          schema: [
            {
              id: 'field1',
              name: 'email',
              type: 'email',
              system: false,
              required: true,
              presentable: true,
              unique: true,
              options: {},
            },
          ],
          indexes: [],
          listRule: null,
          viewRule: null,
          createRule: null,
          updateRule: null,
          deleteRule: null,
          options: {},
        },
      ];

      mockPocketBase.collections.getFullList.mockResolvedValue(mockCollections);

      const result = await crud.getCollections();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'col1',
        name: 'users',
        type: 'auth',
        system: false,
        schema: [
          {
            id: 'field1',
            name: 'email',
            type: 'email',
            system: false,
            required: true,
            presentable: true,
            unique: true,
            options: {},
          },
        ],
      });
    });
  });

  describe('getCollection', () => {
    it('should return single collection by name', async () => {
      const mockCollection = {
        id: 'col1',
        name: 'users',
        type: 'auth',
        system: false,
        schema: [
          {
            id: 'field1',
            name: 'email',
            type: 'email',
            system: false,
            required: true,
            presentable: true,
            unique: true,
            options: {},
          },
        ],
        indexes: [],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        options: {},
      };

      mockPocketBase.collections.getOne.mockResolvedValue(mockCollection);

      const result = await crud.getCollection('users');

      expect(mockPocketBase.collections.getOne).toHaveBeenCalledWith('users');
      expect(result.name).toBe('users');
      expect(result.type).toBe('auth');
    });
  });

  describe('getCollectionSchema', () => {
    it('should return only schema fields', async () => {
      const mockCollection = {
        id: 'col1',
        name: 'users',
        type: 'auth',
        system: false,
        schema: [
          {
            id: 'field1',
            name: 'email',
            type: 'email',
            system: false,
            required: true,
            presentable: true,
            unique: true,
            options: {},
          },
          {
            id: 'field2',
            name: 'name',
            type: 'text',
            system: false,
            required: false,
            presentable: true,
            unique: false,
            options: {},
          },
        ],
        indexes: [],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        options: {},
      };

      mockPocketBase.collections.getOne.mockResolvedValue(mockCollection);

      const result = await crud.getCollectionSchema('users');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('email');
      expect(result[1].name).toBe('name');
    });
  });

  describe('CRUD operations', () => {
    beforeEach(() => {
      const mockCollection = {
        create: vi.fn(),
        getOne: vi.fn(),
        getList: vi.fn(),
        getFullList: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      mockPocketBase.collection.mockReturnValue(mockCollection);
    });

    describe('create', () => {
      it('should create record in collection', async () => {
        const mockRecord = { id: '123', name: 'Test User' };
        const mockCollection = mockPocketBase.collection();
        mockCollection.create.mockResolvedValue(mockRecord);

        const result = await crud.create('users', { name: 'Test User' });

        expect(mockPocketBase.collection).toHaveBeenCalledWith('users');
        expect(mockCollection.create).toHaveBeenCalledWith({ name: 'Test User' });
        expect(result).toEqual(mockRecord);
      });
    });

    describe('getOne', () => {
      it('should get single record by id', async () => {
        const mockRecord = { id: '123', name: 'Test User' };
        const mockCollection = mockPocketBase.collection();
        mockCollection.getOne.mockResolvedValue(mockRecord);

        const result = await crud.getOne('users', '123');

        expect(mockPocketBase.collection).toHaveBeenCalledWith('users');
        expect(mockCollection.getOne).toHaveBeenCalledWith('123', undefined);
        expect(result).toEqual(mockRecord);
      });

      it('should pass expand options', async () => {
        const mockRecord = { id: '123', name: 'Test User' };
        const mockCollection = mockPocketBase.collection();
        mockCollection.getOne.mockResolvedValue(mockRecord);

        await crud.getOne('users', '123', { expand: 'profile' });

        expect(mockCollection.getOne).toHaveBeenCalledWith('123', { expand: 'profile' });
      });
    });

    describe('getList', () => {
      it('should get paginated list with default options', async () => {
        const mockResult = {
          page: 1,
          perPage: 30,
          totalItems: 100,
          totalPages: 4,
          items: [{ id: '1', name: 'User 1' }],
        };
        const mockCollection = mockPocketBase.collection();
        mockCollection.getList.mockResolvedValue(mockResult);

        const result = await crud.getList('users');

        expect(mockCollection.getList).toHaveBeenCalledWith(1, 30, {});
        expect(result).toEqual(mockResult);
      });

      it('should pass query options', async () => {
        const mockCollection = mockPocketBase.collection();
        mockCollection.getList.mockResolvedValue({});

        await crud.getList('users', {
          page: 2,
          perPage: 50,
          filter: 'name != ""',
          sort: '-created',
        });

        expect(mockCollection.getList).toHaveBeenCalledWith(2, 50, {
          filter: 'name != ""',
          sort: '-created',
        });
      });
    });

    describe('update', () => {
      it('should update record by id', async () => {
        const mockRecord = { id: '123', name: 'Updated User' };
        const mockCollection = mockPocketBase.collection();
        mockCollection.update.mockResolvedValue(mockRecord);

        const result = await crud.update('users', '123', { name: 'Updated User' });

        expect(mockCollection.update).toHaveBeenCalledWith('123', { name: 'Updated User' });
        expect(result).toEqual(mockRecord);
      });
    });

    describe('delete', () => {
      it('should delete record by id', async () => {
        const mockCollection = mockPocketBase.collection();
        mockCollection.delete.mockResolvedValue(true);

        const result = await crud.delete('users', '123');

        expect(mockCollection.delete).toHaveBeenCalledWith('123');
        expect(result).toBe(true);
      });
    });
  });
});
