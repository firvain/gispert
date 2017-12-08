var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

var MongoClient = require('mongodb').MongoClient;
const config = require('../../config');

function jwtSignUser (user) {
 const ONE_WEEK = 60 * 60 * 24 * 7;
 return jwt.sign(user, config.authentication.jwtSecret, {
  //  expriresIn: ONE_WEEK,
 })
}

router.route('/')
  .get(function getusers(req, res) {
   MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var name = req.query.name;
      var password = req.query.password;
      // console.log(req.query);
      console.log(name);
      console.log(password);

      if (err) {
        res.send({
          error: 'Login information was incorrect'
        });
      } else {
        var query = {name: req.query.name, pass: req.query.password};
        db.collection('users').find(query).toArray(function(err, result){
          if (err) {
            throw err;
          } else if (result.length == 0) {
            res.send({
              error: 'Login information was incorrect'
            });
            db.close();
          } else {
            // console.log(result);
            const user = result[0];
            // console.log(jwtSignUser(user));
            res.send({
              user: user,
              // TODO when token expires?
              token: jwtSignUser(user),
            });
            db.close();            
          }
        });
      }
    });
  });

module.exports = router;
