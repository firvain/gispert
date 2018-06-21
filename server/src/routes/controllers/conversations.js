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
    let start = parseInt(req.query.start);
    const end = parseInt(req.query.end);
    const userId = req.query.userId;
    if (start < 0) {
      start = 0;
    }
    userList.push(userId);
    // console.log('userList:: ', userList, typeof (userList));

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
          // console.log(docs);
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
  const Database = require('../database'), dbUrl = 'mongodb://' + config.mongodbHost + config.dbName
  const database = new Database(dbUrl);
  const featureId = req.body.data.featureId;
  database.connect()
  .then((res) => {
    return res = database.findLiveGeodata(featureId);
  })
  .then(function (cursor) {
    return cursor.toArray();
  })
  .then((res) => {
    const updatedFeature = JSON.parse(res[0].feature.feature);
    updatedFeature.id = res[0]._id;
    updatedFeature.properties.strkClr = req.body.data.strkClr;
    updatedFeature.properties.strkWdth = req.body.data.strkWdth;
    updatedFeature.properties.fllClr = req.body.data.fllClr;
    return updatedFeature;
  })
  .then(function (feature) {
    console.log('sending symbology');
    const id = database.setFeatureSymbology(feature);
    return id;
  })
  // .then(function(id) {
  //   console.log('updated:: ' , id);
  // })
  .catch(function (err) {
    throw err;
  });
});


module.exports = router;