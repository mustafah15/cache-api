# cache api

This project is provides APIs for CRUD operations to cache resources and it handles all the logic according to the spec file.

## installation

- run the docker image it will build the project and all it's dependencies
```
cp .env-example .env
npm run docker
```
- for running the tests
```
npm run test
```
- for checking the lint
```
npm run lint
```
- for checking tests coverage
```
npm run coverage
```
- and for starting the server 
```
npm runs server
```

##  usage

### GET request to /cache
this for list all the cache objects

### GET request to /cache/{key}
for getting specific cache object by it's key

### POST request to /cache/{key}
### PUT request to /cache/{key}

for creating a new cache object if this key does not exists before if it exists it will update the data with the provided data in the body.

### DELETE request to /cache/{key}
this will delete an object by it's key

### DELETE request to /cache
this for deleting all the database
