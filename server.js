/* istanbul ignore file */
'use strict';

const container = require('./container');
const{ express } = require('./config')[process.env.NODE_ENV];

const expressApp = container['express.app'];

expressApp.listen(express.port);
console.log('listening..');
