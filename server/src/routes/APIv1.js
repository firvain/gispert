const express = require('express');
const router = express.Router(); // eslint-disable-line

const users = require('./controllers/users');
const posts = require('./controllers/posts');
const fileLayers = require('./controllers/fileLayers');
const apiGeodata = require('./controllers/apiGeodata');
const groups = require('./controllers/groups');
const login = require('./controllers/login');

router.use('/users', users);
router.use('/posts', posts);
router.use('/fileLayers', fileLayers);
router.use('/apiGeodata', apiGeodata);
router.use('/groups', groups);
router.use('/login', login);

module.exports = router;
