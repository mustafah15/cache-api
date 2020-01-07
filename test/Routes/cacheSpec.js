'use strict';

const _ = require('lodash');

const expect = require ('../resources/chai').expect;
const container = require('../../container');
const request = require('supertest');

const cacheSample = {
    key: _.repeat('f', 12),
    data: _.repeat('fa', 12),
};

const anotherCacheSample = {
    key: _.repeat('e', 12),
    data: _.repeat('ea', 12),
};

describe('Routes/cache', () => {
    let dbConnection;
    let createdCache;
    const app = container['express.app'];
    const cacheRepository = container['cache.repository'];

    before(async() => {
        dbConnection = await container['database.connection'];
        const connection = await dbConnection.dropDatabase();
        return connection;
    });

    after(() => dbConnection.dropDatabase());

    describe('GET /cache/:key', () => {
        it('should create a new cache', async() => {
            const promise = request(app)
                .get(`/cache/${cacheSample.key}`)
                .send(cacheSample)
                .expect(201)
                .then(response => {
                    expect(response.body.message).to.be.equal('cache miss');
                    expect(response.body.cache).to.be.an('object').and.contain.keys([
                        'key', 'data', 'ttl', 'created_at', 'updated_at',
                    ]);
                    expect(response.body.cache).to.containSubset(cacheSample);
                    createdCache = response.body.cache;
                });
            return promise;
        });

        it('should return an existing cache by a key', () => {
            const promise = request(app)
                .get(`/cache/${cacheSample.key}`)
                .expect(200)
                .then(response => {
                    expect(response.body.message).to.be.equal('cache hit');
                    expect(response.body.cache).to.containSubset(cacheSample);
                });
            return promise;
        });
    });

    describe('GET /cache', () => {
        it('should return all created cache objects', () => {
            const promise = request(app)
                .get('/cache')
                .expect(200)
                .then(response => {
                    expect(response.body).to.be.an('array').and.have.lengthOf(1);
                    expect(response.body).to.be.deep.equal([createdCache]);
                });
            return promise;
        });
    });

    describe('POST /cache/:key', () => {
        it('should create new cache object', () => {
            const promise = request(app)
                .post(`/cache/${anotherCacheSample.key}`)
                .send(anotherCacheSample)
                .expect(201)
                .then(response => {
                    expect(response.body.cache).to.be.an('object');
                    expect(response.body.cache).to.be.an('object').and.contain.keys([
                        'key', 'data', 'ttl', 'created_at', 'updated_at',
                    ]);
                    expect(response.body.cache).to.containSubset(anotherCacheSample);
                });
            return promise;
        });

        it('should return a 400 error', () => {
            const promise = request(app)
                .post('/cache/invalid_key')
                .send({})
                .expect(400)
                .then(response => {
                    expect(response.body).to.contain.keys(['error']);
                    expect(response.body.error).to.be.equal('invalid_data');
                });
            return promise;
        });
    });

    describe('PUT /cache/:key', () => {
        it('should update an existing object', () => {
            const data = 'new_data_to_update';
            const promise = request(app)
                .post(`/cache/${anotherCacheSample.key}`)
                .send({ data })
                .expect(200)
                .then(response => {
                    expect(response.body.cache.data).to.be.equal(data);
                });
            return promise;
        });
    });

    describe('DELETE /cache/:key', () => {
        it('should delete a single object', () => {
            const promise = request(app)
                .delete(`/cache/${anotherCacheSample.key}`)
                .expect(200)
                .then(response => {
                    expect(response.body.deletedCount).to.be.equal(1);
                });

            return promise;
        });
    });

    describe('DELETE /cache', () => {
        it('should delete all cache objects', () => {
            const promise = request(app)
                .delete('/cache')
                .expect(200)
                .then(async response => {
                    expect(response.body.deletedCount).to.be.equal(1);
                    const data = await cacheRepository.findAll();
                    expect(data).to.be.an('array').and.have.lengthOf(0);
                });
            return promise;
        });
    });
});
