const express = require('express');
const router = express.Router(); // eslint-disable-line

const users = require('./controllers/users');
const posts = require('./controllers/posts');
const fileLayers = require('./controllers/fileLayers');
const apiGeodata = require('./controllers/apiGeodata');
const groups = require('./controllers/groups');
const login = require('./controllers/login');
const collections = require('./controllers/collections');

router.use('/users', users);
router.use('/posts', posts);
router.use('/fileLayers', fileLayers);
router.use('/apiGeodata', apiGeodata);
router.use('/groups', groups);
router.use('/login', login);
router.use('/collections', collections);

module.exports = router;
