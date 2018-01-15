var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

router.route('/')
    .get(function getusers(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var collection = db.collection('collections');
            if (err) {
                console.log(err);
            }
            collection.find({},{visibility: 'public'}).toArray(function handleCursor(error, docs) {
                var data = {};
                if (err) {
                    res.sendStatus(500);
                    console.log(error);
                } else {
                    res.send(docs);
                    db.close();
                }
            });
        });
    })
    .post(function setuser(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var group = req.body;
            var newGroup = {
                name: req.body.name,
                creator: req.body.creator,
                timecreated: req.body.timecreated,
                members: [req.body.members]
            };
            // console.log(req.body);
            console.log(newGroup);
            if (err) {
                throw err;
            } else {
                db.collection('groups').insertOne(
                    newGroup
                );
                res.status(200).send();
            }
            db.close();
        });
    });

router.route('/delete')
    .post(function setuser(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var _id = req.body._id;
            var cId = new ObjectID(_id);
            console.log(req.body);

            if (err) {
                throw err;
            } else {
                db.collection('collections').remove(
                    { _id: cId }
                );
                res.status(200).send();
            }
            db.close();
        });
    });
module.exports = router;
