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


router.route('/feature')
.post(function set(req, res) {
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    const feature = req.body.feature;
    console.log('feature add:: ', feature);
    if (err) {
      throw err;
    } else {
      db.collection('liveGeodata').insertOne(
        { feature }
      );
      res.sendStatus(200);
    }
    db.close();
  });
})
.get(function get(req, res) {
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    const userList = req.query.userList;
    const start = parseInt(req.query.start);
    const end = parseInt(req.query.end);
    const userId = req.query.userId;
    userList.push(userId);
    console.log('userList:: ', userList, typeof (userList));

    if (err) {
      throw err;
    } else {
      db.collection('liveGeodata').find(
        { "feature.userId": { $in: userList } }
      ).skip(start).limit(end).toArray(function handleCursor(error, docs) {
        if (error) {
          res.sendStatus(500);
          console.log(error);
        } else {
          console.log(docs);
          res.status(200).send(docs);
          db.close();
        }
      });
    }
    db.close();
  });    
});


router.route('/setsymbology')
.post(function set(req, res) {
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    const featureId = req.body.data.featureId;
    console.log('feature add:: ', req.body.data.featureId);
    if (err) {
      throw err;
      res.sendStatus(500);
    } else {
      const regexValue = ".*" + featureId + ".*";
      console.log(regexValue);
      db.collection('liveGeodata').find(
        { "feature.feature": { "$regex": regexValue} }
      ).toArray(function handle(err, res) {
        if (err) {
          throw err;
        } else {
          console.log('result', res);
        }
      });
      res.sendStatus(200);
    }
    db.close();
  });
});


module.exports = router;