const express = require('express');
const router = express.Router(); // eslint-disable-line

const login = require('./controllers/login');
const public = require('./controllers/public');

router.use('/login', login);
router.use('/public', public);

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
