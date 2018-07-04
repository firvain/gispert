var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

router.route('/')
.post(function set(req, res) {
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    const msg = req.body.data;
    console.log(msg);
    const message = {
      userId: msg.userId,
      userName: msg.userName,
      content: msg.content,
      date: msg.date,
      featureId: msg.featureId,
    };

    console.log('conversation add:: ', message);
    if (err) {
      throw err;
    } else {
      db.collection('conversations').insertOne(
        { message }
      );
      res.sendStatus(200);
    }
    db.close();
  });
})
.get(function get(req, res) {
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    const featureId = req.query.featureId;
    const start = parseInt(req.query.start);
    const end = parseInt(req.query.end);
    // const fId = new ObjectID(featureId);

    console.log('conversation get:: ', featureId);
    if (err) {
      throw err;
    } else {
      db.collection('conversations').find(
        { "message.featureId": featureId }
      ).skip(start).limit(end).sort({ "message.date": -1 }).toArray(function handleCursor(error, docs) {
        if (error) {
          res.sendStatus(500);
          console.log(error);
        } else {
          // console.log(docs);
          res.status(200).send(docs);
          db.close();
        }
      });
    }
    db.close();
  });    
});


module.exports = router;