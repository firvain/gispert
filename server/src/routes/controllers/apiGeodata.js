var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

router.route('/')
  .get(function getusers(req, res) {
   MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('apiGeodata');
      if (err) {
        console.log(err);
      }
      collection.find().toArray(function handleCursor(error, docs) {
        var data = {};
        if (err) {
          res.sendStatus(500);
          console.log(error);
        } else {
          // data.type = 'FeatureCollection';
          // data.crs = { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } };
          // data.features = docs[0].features;
          console.log(docs);
          res.send(docs);
          db.close();
        }
      });
    });
  })
 .post(function setuser(req, res) {
   MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
     var urlLayer = req.body;
     console.log(req.body);
     if (err) {
       throw err;
     } else {
       db.collection('apiGeodata').insertOne(
        urlLayer
       );
       res.status(200).send();
     }
     db.close();
   });
 });
module.exports = router;
