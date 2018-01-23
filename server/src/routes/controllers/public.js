var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');
console.log('loading public route');

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

router.route('/collections')
    .get(function getcollections(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var collection = db.collection('collections');
            if (err) {
                console.log(err);
            }
            collection.find({ visibility: 'public' }, {}).toArray(function handleCursor(error, docs) {
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

router.route('/timeline')
.get(function getcollections(req, res) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
    .then(function (db) {
      var collection = db.collection('posts');
      return collection.aggregate([
        { $match: {  $and: [ { 'isReplyTo': '' }, {"groups" : "0"} ]}},
        { $graphLookup: {
            from: "posts",
            startWith: "$replies",
            connectFromField: "_id",
            connectToField: "_id",
            as: "repliesData",
            restrictSearchWithMatch: { "groups" : "0" }
          }
        } ,
        {
            $sort: { 'timestamp': -1 }
        },
        {
            $skip: start
        },
        {
            $limit: end
        },
      ]);
    })
    .then(function (cursor) {
        return cursor.toArray();
    })
    .then(function (content) {
        content.forEach((p) => {
            if(p.repliesData) {
                p.repliesData.sort(dynamicSort("timestamp"));
            }
        });
        res.status(200).json(content);
    })
    .catch(function (err) {
        throw err;
    });
})

module.exports = router;
