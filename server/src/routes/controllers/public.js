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
            var userid = req.query.userId;
            // console.log('public of user:: ', userid);
            var collection = db.collection('collections');
            if (err) {
                console.log(err);
            }

            collection.find({
                $or: [{
                    $and: [
                        { visibility: 'public' }, 
                        { members: ObjectID(userid) }
                    ]    
                }, {
                    $and: [
                        { visibility: 'public' }, 
                        { user: ObjectID(userid) }
                    ]                        
                }]
            }, {}).toArray(function handleCursor(error, docs) {
                // var data = {};
                if (err) {
                    res.sendStatus(500);
                    console.log(error);
                } else {
                    // docs.unshift({ title: 'Δημόσια Συλλογή', id: '0', description: 'Συλλογή που μπορούν να δουν όλοι' });
                    var result = [];
                    docs.forEach((d) => {
                        // console.log(d.user.toString(), userid);
                        if (d.user.toString() === userid) {
                            result.unshift(d);
                        } else {
                            result.push(d);
                        }
                    });
                    // console.log(docs);
                    res.send(result);
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
        { $graphLookup: {
            from: "posts",
            startWith: "$replies",
            connectFromField: "_id",
            connectToField: "_id",
            as: "repliesData",
          }
        },
        { $graphLookup: {
            from: "collections",
            startWith: "$collections",
            connectFromField: "collections",
            connectToField: "_id",
            as: "collectionData",
          }
        },
        {
            $sort: { 'timestamp': -1, 'repliesData.timestamp' : -1 }
        },
        { "$project": {
            "_id": 1,
            "userId": 1,
            "userName": 1,
            "timestamp": 1,
            "text":1,
            "userFeatures": 1,
            "isReplyTo":1,
            "replies":1,
            "collectionData": {
               "$filter": {
                   "input": "$collectionData",
                   "as": "child",
                   "cond": { "$eq": [ "$$child.visibility", "public" ] }
               }
            }
        }},
        { $match: {  
          $and: [ 
            { 'isReplyTo': '' }, {'collectionData': { $size: 1 }}
          ]}
        },
        {
            $skip: start
        },
        {
            $limit: end
        }        
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
});


router.route('/postid')
.get(function getSpecificPost(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
      var collection = db.collection('posts');
      var postId = req.query.pId;
    //   console.log('fetching specific post::', postId);
    //   var userId = req.query.userId;
      return collection.aggregate([
        {
          $graphLookup: {
            from: "posts",
            startWith: "$replies",
            connectFromField: "_id",
            connectToField: "_id",
            as: "repliesData",
          }
        },
        {
          $graphLookup: {
            from: "collections",
            startWith: "$collections",
            connectFromField: "collections",
            connectToField: "_id",
            as: "collectionData",
          }
        },
        {
          $sort: { 'timestamp': -1, 'repliesData.timestamp': -1 }
        },
        {
          "$project": {
            "_id": 1,
            "userId": 1,
            "userName": 1,
            "timestamp": 1,
            "text": 1,
            "userFeatures": 1,
            "isReplyTo": 1,
            "replies": 1,
            "collectionData": {
              "$filter": {
                "input": "$collectionData",
                "as": "child",
                "cond": { $or: [
                  { "$eq": ["$$child.visibility", "public"] },
                  // { "$eq": ["$$child.user", ObjectId(userId)] }
                ] }
              }
            }
          }
        },
        {
          $match: {
            $and: [
              // { 'collectionData': { $size: 1 }}, 
              { '_id': ObjectID(postId) }
            ]
          }
        },
      ]);
    })
  .then(function (cursor) {
    return cursor.toArray();
  })
  .then(function (content) {
    content.forEach((p) => {
      if (p.repliesData) {
        p.repliesData.sort(dynamicSort("timestamp"));
      }
    });
    // console.log('specific post is:: ', content);
    res.status(200).json(content);
  })
  .catch(function (err) {
    throw err;
  });
});



module.exports = router;
