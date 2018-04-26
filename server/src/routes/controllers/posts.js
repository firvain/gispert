'use strict'
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../../config');
var ObjectId = require('mongodb').ObjectID;

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

router.route('/')
 .post(function setpost(req, res) {
  var post = {
    userId: req.body.userPost.userId,
    userName: req.body.userPost.username,
    timestamp: String(Math.trunc(req.body.userPost.timestamp)),
    text: req.body.userPost.text,
    userFeatures: req.body.userPost.userFeatures,
    isReplyTo: req.body.userPost.isReplyTo,
    collections: ObjectId(req.body.userPost.collections),
    replies: req.body.userPost.replies
  };
  const Database = require('../database')
      , dbUrl = 'mongodb://' + config.mongodbHost + config.dbName
  const database = new Database(dbUrl);
  database.connect()
    .then((id) => { 
      return id = database.addPost(post);
    })
    .then((id) => {
      if (req.body.userPost.isReplyTo) {
        database.addReply(req.body.userPost.isReplyTo, id);
        // console.log('the inserted id was :: ', id);
      }
      return id;
    })
    .then((repliedPostCreator) => {
      if (req.body.userPost.isReplyTo) {
        return repliedPostCreator = database.findRepliedPost(req.body.userPost.isReplyTo);
        // console.log('replied post:: ', repliedPostCreator, ' id:: ', id);
      }
    })
    .then((repliedPostCreator) => {
      if(repliedPostCreator) {
        const notification = {
          collectionId: post.collections,
          byUser: new ObjectId(post.userId),
          type: 'replyToMyPost',
          timestamp: post.timestamp,
          userCreated: new ObjectId(repliedPostCreator[0].userId),
          text: repliedPostCreator[0].text,
          features: repliedPostCreator[0].userFeatures,
          read: 0
        };
        console.log('notification of a reply', notification);
        database.notifyPost(notification);
      } else {
        const notification = {
          collectionId: post.collections,
          byUser: new ObjectId(post.userId),
          type: 'newPostInCollection',
          timestamp: post.timestamp,
          // userCreated: new ObjectId(repliedPostCreator[0].userId),
          // text: repliedPostCreator[0].text,
          // features: repliedPostCreator[0].userFeatures,
          read: 0
        };
        console.log('notification of a reply', notification);
        database.notifyPost(notification);
      }
    })
    .then((id) => {
      res.status(200).json(id);
      database.close();
    })
    .catch((err) => {
      if (err){
        console.log(err);
      }
    });
 });

router.route('/all')
  .get(function getposts(req, res) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
    var userId = req.query.userId;
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
                   "cond": { $or: [ { "$eq": [ "$$child.visibility", "public" ] }, { "$eq": [ "$$child.user", ObjectId(userId) ] } ] }
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
        db.close();
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
        // db.close();
      })
      .catch(function (err) {
        throw err;
      });
    });

router.route('/replies')
.get(function getreplies(req, res) {
  var start = parseInt(req.query.start);
  var end = parseInt(req.query.end);
  var ids = req.query.ids;
  var userId = ObjectId(req.query.userId);

  console.log('ids to fetch ', ids, start, end);
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
  .then(function (db) {
    var collection = db.collection('posts');
    var objectids = [];
    ids.forEach((id) => {
      objectids.push(ObjectId(id));
    });

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
                 "cond": { $or: [ { "$eq": [ "$$child.visibility", "public" ] }, { "$eq": [ "$$child.user", ObjectId(userId) ] } ] }
             }
          }
      }},
      {
        $match: { "_id": { $in: objectids }}
      },
      {
        $skip: start
      },
      {
          $limit: end
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

router.route('/id')
  .get(function getSpecificPost(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
      var collection = db.collection('posts');
      var postId = req.query.pId;
      console.log('fetching specific post::', postId);
      var userId = req.query.userId;
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
              { '_id': ObjectId(postId) }
            ]
          }
        },
      ]);
      db.close();
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
    console.log('specific post is:: ', content);
    res.status(200).json(content);
  })
  .catch(function (err) {
    throw err;
  });
});


router.route('/person')
  .get(function getposts(req, res) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
    var userId = req.query.userId;
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
            "isReplyTo": 1,
            "replies": 1,
            "collectionData": {
               "$filter": {
                   "input": "$collectionData",
                   "as": "child",
                   "cond": { $or: [ { "$eq": [ "$$child.visibility", "public" ] } ] }
               }
            }
        }},
        { $match: {  
            $and: [
              { 'isReplyTo': '' }, { 'userId' : userId }
            ]
          }
        },
        {
          $skip: start
        },
        {
          $limit: end
        }
      ]);
        db.close();
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
        // db.close();
      })
      .catch(function (err) {
        throw err;
      });
    });

// router.route('/hashtag')
// .get(function getHashtagPosts(req, res) {
//     MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
//       var hashtag;
//       hashtag = req.query.hashtag;
//       var collection = db.collection('posts');
//       var regexValue = '.*' + hashtag + '.*';
//       if (err) {
//         throw err;
//       }
//       collection.find({ text: { $regex : regexValue } }).toArray(
//         function handleCursor(error, docs) {
//           if (err) {
//             res.sendStatus(500);
//             console.log(error);
//           } else {
//             console.log(docs);
//             res.send(docs);
//             db.close();
//           }
//         });
//     });
// });

// router.route('/feature')
// .get(function getPersonsPosts(req, res) {
//    // db.posts.findOne({"text" : {$regex : ".*myron.*"}});
//     MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
//       // Create your schemas and models here.
//       var featureId;
//       featureId = req.query.featureId;
//       console.log(featureId);
//       var collection = db.collection('posts');
//       var regexValue = '.*' + featureId + '.*';

//       if (err) {
//         throw err;
//       }
//       collection.find({ userFeatures: { $regex : regexValue } }).toArray(
//         function handleCursor(error, docs) {
//           if (err) {
//             res.sendStatus(500);
//             // console.log(error);
//           } else {
//             // console.log(docs);
//             res.send(docs);
//             db.close();
//           }
//         });
//     });
// });

// router.route('/search')
// .get(function getHashtagPosts(req, res) {
//     MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
//       var term;
//       term = req.query.term;
//       var collection = db.collection('posts');
//       collection.createIndex({text: 'text'});

//       if (err) {
//         throw err;
//       }
//       collection.find({ $text: { $search: term } }).toArray(
//         function handleCursor(error, docs) {
//           if (err) {
//             res.sendStatus(500);
//           } else {
//             console.log(docs);
//             res.send(docs);
//             db.close();
//           }
//         });
//     });
// });

// router.route('/allGeodata')
//   .get(function getusers(req, res) {
//     MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
//       var collection = db.collection('posts');
//       if (err) {
//         throw err;
//       }
//       collection.find({}, { userFeatures: 1 }).toArray(function handleCursor(error, docs) {
//         if (err) {
//           res.sendStatus(500);
//           console.log(error);
//         } else {
//           console.log(docs);
//           res.send(docs);
//           db.close();
//         }
//       });
//     });
//   });

module.exports = router;
