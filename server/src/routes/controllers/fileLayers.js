var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../../config');

router.route('/')
    .get(function getByLayerId(req, res) {
      MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
        var collection = db.collection('geodata');
        if (err) {
          throw err;
        }
        collection.find({}, { features: 0 }).toArray(function handleCursor(error, docs) {
          if (error) {
            res.sendStatus(500);
            console.log(error);
          } else {
            console.log(docs);
            res.send(docs);
            db.close();
          }
        });
      });
    })
  .post(function insertLayer(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var fileLayer = req.body;
      console.log('New Layer Insert Statement');
      console.log(fileLayer);
      console.log(req.body.features);
      if (err) {
        throw err;
      } else {
        db.collection('geodata').insertOne(
         fileLayer
        );
        res.status(200).send();
      }
      db.close();
    });
  });
router.route('/id')
  .get(function getAllLayerProperties(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('geodata');
      var id = req.query.id;
      console.log(id);
      if (err) {
        console.log(err);
      }
      collection.find({ id: id }, { features: 1 }).toArray(function handleCursor(error, docs) {
        var data = {};
        if (error) {
          res.sendStatus(500);
          console.log(error);
        } else {
          data = JSON.parse(docs[0].features);
          // console.log(docs);
          res.send(data);
          db.close();
        }
      });
    });
  });

module.exports = router;
