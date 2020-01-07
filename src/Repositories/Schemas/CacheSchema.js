'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cache = new Schema({
    key: {
        type: String,
        trim: true,
        index: true,
    },
    data: {
        type: String,
        default: Math.random().toString(36).slice(2),
    },
    ttl: {
        type: Number,
        default: 3600, //one hour
    },
    updated_at: {
        type: Date,
        default: Date.now,
        index: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

module.exports = Cache;
