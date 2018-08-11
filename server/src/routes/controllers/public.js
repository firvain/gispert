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
    var userId = req.query.userId;
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        var collection = db.collection('collections');
        return collection.aggregate([
          {
            $match: {
              $or: [
                {
                  $and: [
                    { visibility: 'public' },
                    { user: ObjectID(userId) }
                  ]
                },
                {
                  $and: [
                    { visibility: 'public' },
                    { members: ObjectID(userId) }
                  ]
                },
              ]
            }
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              visibility: 1,
              user: 1,
              username: 1,
              members: 1,
              isEditor: {
                $cond: {
                  if: {
                    $or: [
                      { $in: [ObjectID(userId), "$editors"] },
                      //   { $eq: [ObjectID(userId), "$editors"] },
                      { $eq: [ObjectID(userId), "$user"] }
                    ]
                  },
                  then: true,
                  else: false
                }
              },
              isMember: {
                $cond: {
                  if: {
                    $and: [
                      { $in: [ObjectID(userId), "$members"] },
                    ]
                  },
                  then: true,
                  else: false
                }
              }
            }
          }
        ]);
        db.close();
      })
      .then(function (cursor) {
        return cursor.toArray();
      })
      .then(function (content) {
        res.status(200).json(content);
      })
      .catch(function (err) {
        throw err;
      });
  });


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
            from: "features",
            startWith: "$userFeatures",
            connectFromField: "userFeatures",
            connectToField: "properties.mongoID",
            as: "featureData",
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
            "featureData":1,
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
        { $graphLookup: {
            from: "features",
            startWith: "$userFeatures",
            connectFromField: "userFeatures",
            connectToField: "properties.mongoID",
            as: "featureData",
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
            "featureData":1,
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


router.route('/collection')
.get(function getposts(req, res) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
    var collectionId = req.query.collectionId;
    // console.log('getting posts for this collection:: ', collectionId, userId, start, end);
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
            from: "features",
            startWith: "$userFeatures",
            connectFromField: "userFeatures",
            connectToField: "properties.mongoID",
            as: "featureData",
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
        {
            $skip: start
        },
        {
            $limit: end
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
            "featureData":1,
            "collectionData": {
               "$filter": {
                   "input": "$collectionData",
                   "as": "child",
                   "cond": { $or: [ 
                        { "$eq": [ "$$child.visibility", "public" ] }, 
                        // { "$eq": [ "$$child.user", ObjectID(userId) ] } 
                    ] }
               }
            }
        }},
        { $match: {  
          $and: [
            /*{ 'isReplyTo': '' }, {'collectionData': { $size: 1 }},*/ 
            {'collectionData._id': ObjectID(collectionId) },
            { 'isReplyTo': '' },
          ]}
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
    });



module.exports = router;
