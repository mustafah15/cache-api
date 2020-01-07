'use strict';

const _ = require('lodash');

const HTTP_ERRORS = {
    INVALID_DATA: 'invalid_data',
    internal: code => `internal_server_error:${code}`,
};

module.exports = (app, repository) => {
    const respond = async(promise, errorCode) => {
        let status;
        let response;

        try {
            response = await promise;
            status = 200;
            if(response.created) {
                status = 201;
            }
        } catch(error) {
            if('CacheIllegalArgument' === error.name) {
                status = 400;
                response = { error: HTTP_ERRORS.INVALID_DATA };
            } else {
                status = 500;
                response = { error: HTTP_ERRORS.internal(errorCode) };
            }
        }

        return { status, response };
    };

    app.get('/cache', async(req, res) => {
        const promise = repository.findAll();
        const{ status, response } = await respond(promise, 101);
        res.status(status).send(response);
    });

    app.get('/cache/:key', async(req, res) => {
        const cache = _.merge(req.params, req.body);

        const promise = repository.findOneOrCreate(cache);
        const{ status, response } = await respond(promise, 102);
        res.status(status).send(response);
    });

    app.post('/cache/:key', async(req, res) => {
        const cache = _.merge(req.params, req.body);

        const promise = repository.updateOneOrCreate(cache);
        const{ status, response } = await respond(promise, 103);
        res.status(status).send(response);
    });

    app.put('/cache/:key', async(req, res) => {
        const cache = _.merge(req.params, req.body);

        const promise = repository.updateOneOrCreate(cache);
        const{ status, response } = await respond(promise, 104);
        res.status(status).send(response);
    });

    app.delete('/cache/:key', async(req, res) => {
        const promise = repository.deleteOne(req.params.key);
        const{ status, response } = await respond(promise, 105);
        res.status(status).send(response);
    });

    app.delete('/cache', async(req, res) => {
        const promise = repository.deleteAll();
        const{ status, response } = await respond(promise, 106);
        res.status(status).send(response);
    });
};
