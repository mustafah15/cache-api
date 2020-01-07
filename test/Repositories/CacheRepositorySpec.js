'use strict';

const _ = require('lodash');
const{ CacheRepository } = require('../../src').Repositories;

const expect = require ('../resources/chai').expect;
const container = require('../../container');
const Errors = CacheRepository.Errors;

const cacheSample = {
    key: _.repeat('f', 12),
    data: _.repeat('fa', 12),
};

const anotherCacheSample = {
    key: _.repeat('e', 12),
    data: _.repeat('ea', 12),
    ttl: 0,
};

describe('Repositories/Cache', () => {
    let createdCache;
    let dbConnection;
    let cacheRepository;
    let smallTTLCache;

    before(async() => {
        dbConnection = await container['database.connection'];
        cacheRepository = container['cache.repository'];
        const connection = await dbConnection.dropDatabase();
        
        const{ cache } = await cacheRepository.findOneOrCreate(anotherCacheSample);
        smallTTLCache = cache.toObject();

        return connection;
    });

    after(() => dbConnection.dropDatabase());
    
    describe('constructor', () => {
        it('should create an instance of the cache repository', () => {
            expect(cacheRepository).to.be.instanceOf(CacheRepository);
        });
    });

    describe('findOneOrCreate', () => {
        it('should create new cache', async() => {
            const{ message, cache, created } = await cacheRepository.findOneOrCreate(cacheSample);
            expect(message).to.be.a('string').and.equal('cache miss');
            expect(cache.toObject()).to.be.an('object').and.contain.keys([
                'created_at', 'updated_at', 'ttl', 'key', 'data',
            ]);
            expect(cache.toObject()).to.containSubset(cacheSample);
            expect(created).to.be.true;
            createdCache = cache;
        });

        it('should create return an existing cache', async() => {
            const{ message, cache } = await cacheRepository.findOneOrCreate({ key: createdCache.key });
            expect(message).to.be.equal('cache hit');
            expect(cache.toObject()).to.be.deep.equal(createdCache.toObject());
        });

        it('should update an existing cache if ttl exceeded', async() => {
            const{ updated, cache, message } = await cacheRepository.findOneOrCreate({ key: smallTTLCache.key });
            expect(updated).to.be.true;
            expect(cache.created_at).not.equal(cache.updated_at);
            expect(message).to.be.equal('cache miss');
        });

        it('should throw an error if missing key', async() => {
            const promise = cacheRepository.findOneOrCreate({});
            return expect(promise).to.be.eventually.rejectedWith(Error)
                .that.is.instanceOf(Errors.CacheIllegalArgumentError)
                .and.have.property('message')
                .that.equal('invalid cache object to create');
        });
    });

    describe('findAll', () => {
        it('should return all existing caches', async() => {
            const result = await cacheRepository.findAll();
            expect(result).to.be.an('array').and.have.lengthOf(2);
        });
    });

    describe('updateOneOrCreate', () => {
        it('should update existing cache object', async() => {
            const newData = _.repeat('01', 12);
            const{ cache, updated } = await cacheRepository.updateOneOrCreate({ 
                key: smallTTLCache.key, data: newData,
            });
            expect(updated).to.be.true;
            expect(cache.data).to.be.equal(newData);
            expect(cache.key).to.be.equal(smallTTLCache.key);
        });

        it('should create a cache object if it does not exists', async() => {
            const key = _.repeat('00', 12);
            const data = _.repeat('02', 12);
            const{ cache, created } = await cacheRepository.updateOneOrCreate({ key, data });
            expect(created).to.be.true;
            expect(cache.toObject()).to.be.an('object')
                .and.contain.keys(['key', 'data', 'ttl', 'updated_at', 'created_at']);
        });

        it('should throw an error if missing key', () => {
            const promise = cacheRepository.updateOneOrCreate({ data: 'sample_data' });
            return expect(promise).to.be.eventually.rejectedWith(Error)
                .that.is.instanceOf(Errors.CacheIllegalArgumentError)
                .and.have.property('message').that.equal('invalid cache object');
        });

        it('should throw an error if missing data', () => {
            const promise = cacheRepository.updateOneOrCreate({ key: 'sample_key' });
            return expect(promise).to.be.eventually.rejectedWith(Error)
                .that.is.instanceOf(Errors.CacheIllegalArgumentError)
                .and.have.property('message').that.equal('invalid cache object');
        });
    });

    describe('deleteOne', () => {
        it('should delete cache object with a key', async() => {
            const beforeDeleteCache = await cacheRepository.findAll();
            await cacheRepository.deleteOne(createdCache.key);
            const afterDeleteCache = await cacheRepository.findAll();
            
            expect(afterDeleteCache.length).to.be.equal(beforeDeleteCache.length - 1);
        });

        it('should throw an error if missing key', () => {
            const promise = cacheRepository.deleteOne();
            return expect(promise).to.be.eventually.rejectedWith(Error)
                .that.is.instanceOf(Errors.CacheIllegalArgumentError)
                .and.have.property('message').that.equal('invalid cache key');
        });
    });

    describe('deleteAll', () => {
        it('should remove all the cache objects from the database', async() => {
            await cacheRepository.deleteAll();
            const result = await cacheRepository.findAll();

            expect(result).to.be.an('array').and.have.lengthOf(0);
        });
    });
});
