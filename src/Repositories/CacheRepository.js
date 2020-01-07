'use strict';

const _ = require('lodash');
const CACHE_MISS_MESSAGE = 'cache miss';
const CACHE_HIT_MESSAGE = 'cache hit';

class CacheIllegalArgumentError extends Error {

    constructor(message) {
        super(message);
        this.name = 'CacheIllegalArgument';
    }

}

class CacheRepository {

    constructor(mongooseModel) {
        this.model = mongooseModel;
    }

    async findOneOrCreate(params) {
        if(_.isNil(params.key)) {
            throw new CacheIllegalArgumentError('invalid cache object to create');
        }

        const result = {};
        const cache = await this.model.findOne({ key: params.key }).exec();

        if(_.isNil(cache)) {
            result.message = CACHE_MISS_MESSAGE;
            result.cache = await this.model.create(params);
            result.created = true;
        } else {
            if (Date.parse(cache.updated_at) + (cache.ttl * 1000) < Date.now()) {
                cache.data = Math.random().toString(36).slice(2);
                cache.updated_at = new Date();
                cache.save();

                result.updated = true;
                result.message = CACHE_MISS_MESSAGE;
                result.cache = cache;
            } else {
                result.message = CACHE_HIT_MESSAGE;
                result.cache = cache;
            }
        }

        return result;
    }

    async findAll() {
        return this.model.find({}).exec();
    }

    async updateOneOrCreate(params) {
        if(_.isNil(params.key) || _.isNil(params.data)) {
            throw new CacheIllegalArgumentError('invalid cache object');
        }
        
        const result = {};
        const cache =  await this.model.findOne({ key: params.key }).exec();

        if(!_.isNil(cache)) {
            cache.data = params.data;
            cache.updated_at = new Date();
            cache.save();
            result.cache = cache;
            result.updated = true;
        } else {
            result.cache = await this.model.create({ key: params.key, data: params.data });
            result.created = true;
        }

        return result;
    }

    async deleteOne(key) {
        if(_.isNil(key)) {
            throw new CacheIllegalArgumentError('invalid cache key');
        }

        return this.model.deleteOne({ key }).exec();
    }

    async deleteAll() {
        return this.model.deleteMany({}).exec();
    }

}

module.exports = CacheRepository;
module.exports.Errors = {
    CacheIllegalArgumentError,
};
