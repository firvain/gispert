var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');
console.log('loading public route');

router.route('/collections')
    .get(function getcollections(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            // var type = req.query.type;
            // var userId = req.query.userId;
            console.log('get type:: ', type, ' collections public');

            var collection = db.collection('collections');
            if (err) {
                console.log(err);
            }
            collection.find({ $and: [{ visibility: 'public' }] }, {}).toArray(function handleCursor(error, docs) {
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
        });
    })

module.exports = router;
