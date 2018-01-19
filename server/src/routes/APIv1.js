const express = require('express');
const router = express.Router(); // eslint-disable-line

const login = require('./controllers/login');

router.use('/login', login);

// TODO: create public versions of this api
// const posts = require('./controllers/posts');
// const fileLayers = require('./controllers/fileLayers');
// const apiGeodata = require('./controllers/apiGeodata');
// const groups = require('./controllers/groups');
// const collections = require('./controllers/collections');
// router.use('/posts', posts);
// router.use('/fileLayers', fileLayers);
// router.use('/apiGeodata', apiGeodata);
// router.use('/groups', groups);
// router.use('/collections', collections);


module.exports = router;
