'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const connection = require('./connection');
const{ CacheRepository, Schemas } = require('./src').Repositories;

const repository = new CacheRepository(mongoose.model('Cache', Schemas.CacheSchema));

const app = express();
app.use(cors());
app.use(bodyParser.json());
const cacheRoute = require('./src/Routes/cache')(app, repository);

const dbConnection = async() => {
    const database = await connection();
    return database.connection.db;
};

module.exports = {
    'database.connection': dbConnection(),
    'express.app': app,
    'cache.route': cacheRoute,
    'cache.repository': repository,
};
