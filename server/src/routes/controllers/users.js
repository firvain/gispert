var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

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
  })
 .post(function setuser(req, res) {
   MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
     var user = req.body;
         //  console.log(req.body);
          db.collection('users').aggregate([{$match: { name: user.name }}, { $group: { _id: null, count: { $sum: 1 } } }]).toArray(function handleCursor(err, docs){
           //  console.log(docs);
            console.log(user.name);
           //  console.log('count is: ' + docs[0].count);
           console.log(typeof(docs));
           console.log(docs);
            if (docs && docs[0] && docs[0].count) {
             throw err;
             console.log('error user exists');
            }
            else {
              console.log('inserting user');
              db.collection('users').insertOne(
                user
              );
              res.status(200).send();
              db.close();
            }
          });
   });
 });

router.route('/all')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      // Create your schemas and models here.
      var collection = db.collection('users');
      if (err) {
        throw err;
      }
      collection.find({},{pass:0}).toArray(function handleCursor(error, docs) {
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
        { _id : cId },
        { $set: { description: description } }
      );
      res.status(200).send();
    }
    db.close();
  });
});

module.exports = router;