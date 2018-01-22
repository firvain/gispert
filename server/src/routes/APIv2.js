const express = require('express');
var jwt    = require('jsonwebtoken');
var config = require('../config');

const router = express.Router(); // eslint-disable-line

const users = require('./controllers/users');
const posts = require('./controllers/posts');
const fileLayers = require('./controllers/fileLayers');
const apiGeodata = require('./controllers/apiGeodata');
const groups = require('./controllers/groups');
const collections = require('./controllers/collections');

const login = require('./controllers/login');
const public = require('./controllers/public');

router.use('/login', login);
router.use('/public', public);

// route middleware to verify a token
router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  console.log('token is:: ', req.headers['x-access-token']);
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});

router.use('/users', users);
router.use('/posts', posts);
router.use('/fileLayers', fileLayers);
router.use('/apiGeodata', apiGeodata);
router.use('/groups', groups);
router.use('/collections', collections);

module.exports = router;
