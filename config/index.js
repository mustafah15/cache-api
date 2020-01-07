/* istanbul ignore file */
'use strict';

module.exports = {
    [process.env.NODE_ENV]: {
        mongodbUrl: process.env.MONGODB_URL,
        collections: {
            cache: 'cache',
        },
        express: {
            port: 4090,
        },
    },
};
