var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

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
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
  .then(function (db) {
    var collection = db.collection('liveGeodata');
    const userList = req.query.userList;
    let start = parseInt(req.query.start);
    const end = parseInt(req.query.end);
    const userId = req.query.userId;
    if (start < 0) {
      start = 0;
    }
    userList.push(userId);

    return collection.aggregate([
      { $match : { "feature.properties.userId" : { $in: userList } }},
      { $graphLookup: {
          from: "conversations",
          startWith: "$feature.properties.mongoID",
          connectFromField: "feature.properties.mongoID",
          connectToField: "message.featureId",
          as: "messages",
       }},
       { $project: {
          "feature" : 1,
          "messages" : { $arrayElemAt: [ "$messages", 0 ] },
        }
      },
      { $project: {
        "feature.type": 1,
        "feature.geometry" : 1,
        "feature.properties.mongoID" : 1,
        "feature.properties.name" : 1,
        "feature.properties.userId" : 1,
        "feature.properties.strkWdth" : 1,
        "feature.properties.strkClr" : 1,
        "feature.properties.fllClr" : 1,
        "feature.properties.messages" : "$messages.message.content",
      }
    }
  ]);
    db.close();
    })
  .then(function (cursor) {
    return cursor.toArray();
  })
  .then(function (content) {
    // console.log(content);
    res.status(200).json(content);
    // db.close();
  })
  .catch(function (err) {
    throw err;
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

router.route('/delete')
.post(function set(req, res) {
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    const feature = req.body.data.featureId;
    const userId = req.body.data.userId;
    console.log('deleting:: ', feature, userId);
    if (err) {
      throw err;
    } else {
      db.collection('liveGeodata').deleteOne(
        { $and: [
            { "feature.properties.mongoID": feature },
            { "feature.properties.userId": userId }
        ]}
      );
      db.collection('conversations').deleteMany(
            { "message.featureId": feature }
      );
      res.sendStatus(200);
    }
    db.close();
  });
});

module.exports = router;