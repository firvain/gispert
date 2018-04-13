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
      var start = parseInt(req.query.pageFrom);
      var end = parseInt(req.query.pageTo);

      if (err) {
        throw err;
      } else {
        collection.aggregate([
          { 
            $graphLookup: {
              from: "collections",
              startWith: "$_id",
              connectFromField: "_id",
              connectToField: "user",
              as: "collectionData",
            }
          },{ "$project": {
              "_id": 1,
              "name": 1,
              "description": 1,
              "collectionData": {
                 "$filter": {
                     "input": "$collectionData",
                     "as": "child",
                     "cond": { $or: [ { "$eq": [ "$$child.visibility", "public" ] }] }
                 }
              }
          }},
          {
            $skip: start
          },
          {
            $limit: end
          }
        ], function handleCursor(error, users) {
          if (error) {
            res.sendStatus(500);
            console.log(error);
          } else {
            // console.log(docs);
            res.send(users);
            db.close();
          }  
        })
      }
    });
  });

router.route('/updateprofile')
  .post(function update(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var currentUserId;
      var cId;
      var description = req.body.updateInfo.description;
      var email = req.body.updateInfo.email;

      currentUserId = req.body.updateInfo.id;
      cId = new ObjectID(currentUserId);
      console.log('updating user profile:: ', currentUserId, email, description);
      if (err) {
        throw err;
      } else {
        db.collection('users').update(
          { _id: cId },
          { $set: { description: description, email: email } }
        );
        res.status(200).send();
      }
      db.close();
    });
  });


  router.route('/search')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('users');
      var keyword = req.query.keyword;

      if (err) {
        throw err;
      } else {
        collection.aggregate([
          {
            $match: {name: {$regex : ".*"+keyword+".*", '$options' : 'i'}},
          },
          {
            $graphLookup: {
              from: "collections",
              startWith: "$_id",
              connectFromField: "_id",
              connectToField: "user",
              as: "collectionData",
            }
          },{ "$project": {
              "_id": 1,
              "name": 1,
              "description": 1,
              "collectionData": {
                 "$filter": {
                     "input": "$collectionData",
                     "as": "child",
                     "cond": { $or: [ { "$eq": [ "$$child.visibility", "public" ] }] }
                 }
              }
          }}
          // ,{
          //   $skip: start
          // },
          // {
          //   $limit: end
          // }
        ], function handleCursor(error, users) {
          if (error) {
            res.sendStatus(500);
            console.log(error);
          } else {
            // console.log(docs);
            res.send(users);
            db.close();
          }  
        })
      }
    });
  });


  router.route('/setlocale')
  .post(function update(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const currentUserId = req.body.updateInfo.id;
      const locale = req.body.updateInfo.locale;
      cId = new ObjectID(currentUserId);
      // console.log('updating user profile:: ', currentUserId, email, description);

      if (err) {
        throw err;
      } else {
        db.collection('users').update(
          { _id: cId },
          { $set: { locale: locale } }
        );
        res.status(200).send();
      }
      db.close();
    });
  });


  router.route('/notifications')
  .get(function getposts(req, res) {
    var userId = req.query.id;
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
    .then(function (db) {
      var collection = db.collection('notifications');
      return collection.find(
        { user: cId }
      );
        db.close();
      })
      .then(function (cursor) {
        return cursor.toArray();
      })
      .then(function (content) {
        res.status(200).json(content);
        // db.close();
      })
      .catch(function (err) {
        throw err;
      });
    });

  
module.exports = router;