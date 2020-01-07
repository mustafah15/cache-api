/* istanbul ignore file */
'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const{ mongodbUrl } = require('./config')[process.env.NODE_ENV];

let databaseConnection;

module.exports = () => {
    if(!_.isNil(databaseConnection)) {
        return databaseConnection;
    }

    databaseConnection = mongoose.connect(mongodbUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    if('dev' === process.env.NODE_ENV) {
        mongoose.connection.once('open', () => {
            console.log('DB CONNECTION STARTED');
        });

        mongoose.connection.on('error', () => {
            console.error.bind(console, 'connection Error:');
        });

        mongoose.connection.once('disconnected', () => {
            console.log('DB CONNECTION STOPPED');
        });
    }
    
    return databaseConnection;
};
