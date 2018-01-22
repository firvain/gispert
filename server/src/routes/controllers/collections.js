var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

router.route('/')
    .get(function getcollections(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var userId = req.query.userId;
            // console.log('get type:: ', type);
            var collection = db.collection('collections');
            if (err) {
                console.log(err);
            }
            if (userId) {
                collection.find({ $and: [{ visibility: 'private' }, { user: userId }] }, {}).toArray(function handleCursor(error, docs) {
                    console.log(docs);
                    var data = {};
                    if (err) {
                        res.sendStatus(500);
                        console.log(error);
                    } else {
                        res.send(docs);
                        db.close();
                    }
                });
            }
        });
    })
    .post(function setcollection(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var newCollection = req.body.newCollection;
            // console.log(req.body);
            console.log('a new collection:: ', newCollection);
            if (err) {
                throw err;
            } else {
                db.collection('collections').insertOne(
                    newCollection
                );
                res.status(200).send('OK');
            }
            db.close();
        });
    });

router.route('/delete')
    .post(function setuser(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var _id = req.body.id;
            var cId = new ObjectID(_id);
            console.log('collection id to delete:: ', req.body._id);

            if (err) {
                throw err;
            } else {
                db.collection('collections').remove(
                    { _id: cId }
                );
                res.status(200).send('OK');
            }
            db.close();
        });
    });
module.exports = router;
