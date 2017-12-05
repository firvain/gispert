var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../../config');

router.route('/')
    .get(function getGeodataByType(req, res) {
      MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
        var geodataType = req.query.type;
        if (err) {
          throw err;
        }
        db.collection('geodata').aggregate([
          { $unwind: '$features' },
          { $match: { 'features.type': 'Feature' } },
          { $unwind: '$features.properties' },
          { $match: { 'features.properties.type': geodataType } }],
          function handleCursor(error, result) {
            var data = {};
            if (err) {
              res.sendStatus(500);
              console.log(error);
            }
            if (result) {
              data.type = 'FeatureCollection';
              data.crs = { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } };
              data.features = [];
              result.forEach(function filterResults(r) {
                data.features.push(r.features);
              });
              // data.features.push(result[0].features);
            }
            res.send(data);
            db.close();
          });
      });
    })
  .post(function insertGeodata(req, res) {
      res.sendStatus(200);
      // MongoClient.connect('mongodb://mongo/colga_db', function handleConnection(err, db) {
      //   //var userGeodata = req.body;
      //   console.log(req.body);
      //   if (err) {
      //     res.sendStatus(500);
      //     console.log(err);
      //   } else {
      //     // db.collection('geodata').insertOne(
      //     //  userGeodata
      //     // );
      //     res.status(200).send();
      //   }
      //   db.close();
      // });
  });
router.route('/all')
  .get(function getAllGeodata(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('geodata');
      if (err) {
        console.log(err);
      }
      collection.find().toArray(function handleCursor(error, docs) {
        var data = {};
        if (err) {
          res.sendStatus(500);
          console.log(error);
        } else {
          data.type = 'FeatureCollection';
          data.crs = { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } };
          data.features = docs[0].features;
          // console.log(docs);
          res.send(data);
          db.close();
        }
      });
      // var result = db.collection('geodata').aggregate();
      // res.send(result);
    });
  });

router.route('/allnames')
  .get(function getAllGeodata(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('geodata');
      if (err) {
        console.log(err);
      }
      collection.aggregate([
        { $unwind: '$features' },
        { $match: { 'features.type': 'Feature' } },
        { $unwind: '$features.properties' },
        { $project: { 'features.properties.id': 1, 'features.properties.name': 1 } }],
      function handleCursor(error, docs) {
        var data = [];
        // console.log(docs);
        if (err) {
          res.sendStatus(500);
          console.log(error);
        } else {
          docs.forEach(function putDocsInData(d) {
            // console.log(d);
            item = d.features.properties.name + '/' + d.features.properties.id;
            data.push(item);
          });
          res.send(data);
          db.close();
        }
      });
    });
  });
module.exports = router;
