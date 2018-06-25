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
    const feature = JSON.parse(req.body.feature.feature);
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
      // TODO: graphlookup to show the last message from conversations
      db.collection('liveGeodata').find(
        { "feature.properties.userId": { $in: userList } }
      ).sort( [['_id', -1]] ).skip(start).limit(end).toArray(function handleCursor(error, docs) {
        if (error) {
          res.sendStatus(500);
          console.log(error);
        } else {
          console.log('live geodata found:: ', docs);
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
    const feature = req.body.data;
    console.log('feature is :: ', feature);
    if (err) {
      throw err;
    } else {
      if (feature.strkWdth) {
        db.collection('liveGeodata').update({
          "feature.properties.mongoID": feature.featureId
        }, {
          $set:{
              "feature.properties.strkWdth": feature.strkWdth,
          }
        });  
      }
      if (feature.strkClr) {
        db.collection('liveGeodata').update({
          "feature.properties.mongoID": feature.featureId
        }, {
          $set:{
              "feature.properties.strkClr": feature.strkClr,
          }
        });
      }
      if (feature.fllClr) {
        db.collection('liveGeodata').update({
          "feature.properties.mongoID": feature.featureId
        }, {
          $set:{
              "feature.properties.fllClr": feature.fllClr
          }
        });
      }
      res.sendStatus(200);
    }
    db.close();
  });
});


module.exports = router;