var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

function hashPassword(user, options) {
  const SALT_FACTOR = 8;
  if (!user.changed('password')) {
    return;
  }
  return bcrypt
    .genSaltAsync(SALT_FACTOR)
    .then(salt => bcrypt.hashAsync(user.password, salt, null))
    .then(hash => {
      user.setDataValue('pass', hash)
    });
}

router.route('/')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var name = req.query.name;
      if (err) {
        throw err;
      }
      db.collection('users').aggregate([
        { $match: { name: name } }
      ]
        , function handleCursor(error, user) {
          if (error) {
            res.status(500).send({
              error: 'something blew up'
            });
          } else {
            res.send(user);
          }
          db.close();
        });
    });
  });

router.route('/all')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('users');
      if (err) {
        throw err;
      }
      collection.find({}, { pass: 0 }).toArray(function handleCursor(error, docs) {
        if (err) {
          res.sendStatus(500);
          console.log(error);
        } else {
          // console.log(docs);
          res.send(docs);
          db.close();
        }
      });
    });
  });

router.route('/updateUserDescription')
  .post(function addfollowing(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var currentUserId;
      var cId;
      var description = req.body.description;

      currentUserId = req.body.id;
      cId = new ObjectID(currentUserId);

      if (err) {
        throw err;
      } else {
        db.collection('users').update(
          { _id: cId },
          { $set: { description: description } }
        );
        res.status(200).send();
      }
      db.close();
    });
  });

module.exports = router;