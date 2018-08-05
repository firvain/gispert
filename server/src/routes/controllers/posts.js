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
  const features = JSON.parse(req.body.userPost.userFeatures);
  console.log('features to add::', features);
  const featuresIds = [];
  if (features) {
    features.features.forEach((f) => {
      featuresIds.push(f.properties.mongoID);
    });
  }
  let idToReply;
  if (req.body.userPost.isReplyTo !== '') {
    idToReply = ObjectId(req.body.userPost.isReplyTo);
  } else {
    idToReply = '';
  }
  var post = {
    userId: req.body.userPost.userId,
    userName: req.body.userPost.userName,
    timestamp: String(Math.trunc(req.body.userPost.timestamp)),
    text: req.body.userPost.text,
    userFeatures: featuresIds,
    isReplyTo: idToReply,
    collection: ObjectId(req.body.userPost.collection),
    replies: req.body.userPost.replies
  };
  const Database = require('../Database')
      , dbUrl = 'mongodb://' + config.mongodbHost + config.dbName
  const database = new Database(dbUrl);
  database.connect()
    .then((id) => { 
      return id = database.addPost(post);
    })
    .then((id) => {
      if (features) {
        database.addPostFeatures(features.features);
      }
      return id;
    })
    .then((id) => {
      console.log('sending back the new generated id::', id);
      if (req.body.userPost.type === 'reply') {
        database.addReply(req.body.userPost.isReplyTo, id);
        res.json({ id: id, isReplyTo: req.body.userPost.isReplyTo });
        // console.log('the inserted id was :: ', id);
      } else {
        // database.addReply(id, id);
        database.setIsReplyTo(id);
        res.json({id: id, isReplyTo: ''});
      }
      return id;
    })
    .then((id) => {
      if (req.body.userPost.type === 'reply') {
        const creator = database.findRepliedPost(req.body.userPost.isReplyTo).then((response) => {
          const notification = {
            postId: id,
            collectionId: post.collection,
            byUser: new ObjectId(post.userId),
            type: 'replyToMyPost',
            timestamp: post.timestamp,
            userCreated: new ObjectId(response.userId),
            text: post.text,
            features: featuresIds,
            read: 0
          }    
          console.log('a reply notification:::', notification);
          console.log('response from find replied post::', response);
          return notification;
        }).then((notification) => {
          console.log('notification::', notification, id);
          console.log('notifying for reply database');
          database.notifyPost(notification).then(() => {
            database.close();
          });
        });
      }
      if (req.body.userPost.type === 'new') {
        const notification = {
          postId: id,
          collectionId: new ObjectId(req.body.userPost.collection),
          byUser: new ObjectId(req.body.userPost.userId),
          type: 'newPostInCollection',
          timestamp: String(Math.trunc(req.body.userPost.timestamp)),
          // userCreated: new ObjectId(repliedPostCreator[0].userId),
          text: req.body.userPost.text,
          features: featuresIds,
          read: 0
        };
        database.notifyPost(notification).then(() => {
          database.close();
        });
      }
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
          from: "features",
          startWith: "$userFeatures",
          connectFromField: "userFeatures",
          connectToField: "properties.mongoID",
          as: "featureData",
        }},
        { $graphLookup: {
          from: "collections",
          startWith: "$collection",
          connectFromField: "collection",
          connectToField: "_id",
          as: "collectionData",
        }},
        { $project : {
          "post._id": "$_id",
          "post.isReplyTo": "$isReplyTo",
          "post.replies": "$replies",
          "post.featureData": "$featureData",
          "post.collectionData": {
            "$filter": {
                "input": "$collectionData",
                "as": "child",
                "cond": { $or: [
                  { "$eq": [ "$$child.visibility", "public" ] },
                  { "$eq": [ "$$child.user", ObjectId(userId) ] },
                  { $in: [ObjectId(userId), "$$child.members"] },
                ]}
            }
          },
          "editors": "$collectionData.editors",
          "post.userName": "$userName",
          "post.userId": "$userId",
          "post.timestamp": "$timestamp",
          "post.text": "$text"
        }},
        {
          $project: {
            "post._id": 1,
            "post.isReplyTo": 1,
            "post.replies": 1,
            "post.featureData": 1,
            "post.collectionData._id": 1,
            "post.collectionData.description": 1,
            "post.collectionData.title": 1,
            "post.collectionData.user": 1,
            "post.collectionData.username": 1,
            "post.collectionData.visibility": 1,
            "post.collectionData.members": 1,
            "editors": 1,
            "post.collectionData.isEditor": {
              $cond: {
                if: {
                  $or: [
                    { $in: [[ObjectId(userId)], "$editors"] },
                    // { $eq: [userId, "$post.userId"] },
                    { $eq: [ObjectId(userId), { $arrayElemAt: ["$post.collectionData.user", 0] }] }
                  ]
                },
                then: true,
                else: false
              }
            },
            "post.userName": 1,
            "post.userId": 1,
            "post.timestamp": 1,
            "post.text": 1
          }
        },
        {
          $match: {'post.collectionData': { $ne: [] }}
        },
        {
          $sort: { 'post.timestamp' : -1 }
        },
        { $group : {
          _id : "$post.isReplyTo",
          posts: {$push: "$post"},
        }},
        { $project: {
          posts:1,
          count: { $size: "$posts" }
        }},
        {
          $sort: { 'posts.timestamp' : -1 }
        },
        { $project: {
          count:1,
          posts: { $switch: {
            branches: [
              { case: { $gt: [ "$count", 4 ] }, then: {
                  $concatArrays: [{
                    $slice: ["$posts", {
                      $subtract: ["$count", 1]
                    }, "$count"]
                  },
                  { $slice: ["$posts", 0, 4] }]
                }
              },
              { case: { $and : [{$lt: [ "$count", 4 ]}, {$gt: [ "$count", 1 ]} ]}, then: {
                  $concatArrays: [{
                    $slice: ["$posts", {
                      $subtract: ["$count", 1]
                    }, "$count"]
                  },
                  { $slice: ["$posts", 0, { $subtract: ["$count", 1] }] }
                ]}
              },
            ],
            default: { $slice: ["$posts", 0, "$count"] }
         }}}},
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
        // content.forEach((p) => {
        //   if(p.repliesData) {
        //       p.repliesData.sort(dynamicSort("timestamp"));
        //   }
        // });
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
  var userId = req.query.userId;
  var threadId = req.query.id;

  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
    .then(function (db) {
      var collection = db.collection('posts');
      return collection.aggregate([
        {
          $graphLookup: {
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
            startWith: "$collection",
            connectFromField: "collection",
            connectToField: "_id",
            as: "collectionData",
          }
        },
        {
          $project: {
            "post._id": "$_id",
            "post.isReplyTo": "$isReplyTo",
            "post.replies": "$replies",
            "post.featureData": "$featureData",
            "post.collectionData": {
              "$filter": {
                "input": "$collectionData",
                "as": "child",
                "cond": { $or: [
                  { "$eq": [ "$$child.visibility", "public" ] },
                  { "$eq": [ "$$child.user", ObjectId(userId) ] },
                  { $in: [ObjectId(userId), "$$child.members"] },
                ] }
              }
            },
            "editors": "$collectionData.editors",
            "post.userName": "$userName",
            "post.userId": "$userId",
            "post.timestamp": "$timestamp",
            "post.text": "$text"
          }
        },
        {
          $project: {
            "post._id": 1,
            "post.isReplyTo": 1,
            "post.replies": 1,
            "post.featureData": 1,
            "post.collectionData._id": 1,
            "post.collectionData.description": 1,
            "post.collectionData.title": 1,
            "post.collectionData.user": 1,
            "post.collectionData.username": 1,
            "post.collectionData.visibility": 1,
            "post.collectionData.members": 1,
            "editors": 1,
            "post.collectionData.isEditor": {
              $cond: {
                if: {
                  $or: [
                    { $in: [[ObjectId(userId)], "$editors"] },
                    // { $eq: [userId, "$post.userId"] },
                    { $eq: [ObjectId(userId), { $arrayElemAt: ["$post.collectionData.user", 0] }] }
                  ]
                },
                then: true,
                else: false
              }
            },
            "post.userName": 1,
            "post.userId": 1,
            "post.timestamp": 1,
            "post.text": 1
          }
        },
        {
          $match: {
            $and: [
              { 'post.collectionData': { $ne: [] }},
              { 'post.isReplyTo': ObjectId(threadId) }
            ]
          }
        },
        {
          $sort: { 'post.timestamp': -1 }
        },
        {
          $group: {
            _id: "$post.isReplyTo",
            posts: { $push: "$post" },
          }
        },
        {
          $project: {
            posts: 1,
            count: { $size: "$posts" }
          }
        },
        {
          $sort: { 'posts.timestamp': -1 }
        },
        {
          $project: {
            count: 1,
            posts: { $slice: ["$posts", start, end] }
          }
        }
      ]);
      db.close();
    })
    .then(function (cursor) {
      return cursor.toArray();
    })
    .then(function (content) {
      // content.forEach((p) => {
      //   if(p.repliesData) {
      //       p.repliesData.sort(dynamicSort("timestamp"));
      //   }
      // });
      res.status(200).json(content);
      // db.close();
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
          $match: {_id: ObjectId(postId)}
        },
        { $graphLookup: {
          from: "features",
          startWith: "$userFeatures",
          connectFromField: "userFeatures",
          connectToField: "properties.mongoID",
          as: "featureData",
        }},
        { $graphLookup: {
          from: "collections",
          startWith: "$collection",
          connectFromField: "collection",
          connectToField: "_id",
          as: "collectionData",
        }},
        { $project : {
          "post._id": "$_id",
          "post.isReplyTo": "$isReplyTo",
          "post.replies": "$replies",
          "post.featureData": "$featureData",
          "post.collectionData": {
            "$filter": {
                "input": "$collectionData",
                "as": "child",
                "cond": { $or: [
                  { "$eq": [ "$$child.visibility", "public" ] },
                  { "$eq": [ "$$child.user", ObjectId(userId) ] },
                  { $in: [ObjectId(userId), "$$child.members"] },
                ]}
            }
          },
          "editors": "$collectionData.editors",
          "post.userName": "$userName",
          "post.userId": "$userId",
          "post.timestamp": "$timestamp",
          "post.text": "$text"
        }},
        {
          $project: {
            "post._id": 1,
            "post.isReplyTo": 1,
            "post.replies": 1,
            "post.featureData": 1,
            "post.collectionData._id": 1,
            "post.collectionData.description": 1,
            "post.collectionData.title": 1,
            "post.collectionData.user": 1,
            "post.collectionData.username": 1,
            "post.collectionData.visibility": 1,
            "post.collectionData.members": 1,
            "editors": 1,
            "post.collectionData.isEditor": {
              $cond: {
                if: {
                  $or: [
                    { $in: [[ObjectId(userId)], "$editors"] },
                    // { $eq: [userId, "$post.userId"] },
                    { $eq: [ObjectId(userId), { $arrayElemAt: ["$post.collectionData.user", 0] }] }
                  ]
                },
                then: true,
                else: false
              }
            },
            "post.userName": 1,
            "post.userId": 1,
            "post.timestamp": 1,
            "post.text": 1
          }
        },
        {
          $match: {'post.collectionData': { $ne: [] }}
        },
        {
          $sort: { 'post.timestamp' : -1 }
        },
        { $group : {
          _id : "$post.isReplyTo",
          posts: {$push: "$post"},
        }},
        { $project: {
          posts:1,
          count: { $size: "$posts" }
        }},
        {
          $sort: { 'posts.timestamp' : -1 }
        },
        { $project: {
          count:1,
          posts: { $switch: {
            branches: [
              { case: { $gt: [ "$count", 4 ] }, then: {
                  $concatArrays: [{
                    $slice: ["$posts", {
                      $subtract: ["$count", 1]
                    }, "$count"]
                  },
                  { $slice: ["$posts", 0, 4] }]
                }
              },
              { case: { $and : [{$lt: [ "$count", 4 ]}, {$gt: [ "$count", 1 ]} ]}, then: {
                  $concatArrays: [{
                    $slice: ["$posts", {
                      $subtract: ["$count", 1]
                    }, "$count"]
                  },
                  { $slice: ["$posts", 0, { $subtract: ["$count", 1] }] }
                ]}
              },
            ],
            default: { $slice: ["$posts", 0, "$count"] }
         }}}},
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
    var userIdTl = req.query.userIdTl;
    var userIdCl = req.query.userIdCl;
    console.log(userIdTl, userIdCl, start, end);
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        var collection = db.collection('posts');
        return collection.aggregate([{
          $graphLookup: {
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
            startWith: "$collection",
            connectFromField: "collection",
            connectToField: "_id",
            as: "collectionData",
          }
        },
        {
          $match: {
              'userId': userIdTl
          }
        },
        {
          $project: {
            "post._id": "$_id",
            "post.isReplyTo": "$isReplyTo",
            "post.replies": "$replies",
            "post.featureData": "$featureData",
            "post.collectionData": {
              "$filter": {
                "input": "$collectionData",
                "as": "child",
                "cond": {
                  $or: [
                    { "$eq": ["$$child.visibility", "public"] },
                    { "$eq": ["$$child.user", ObjectId(userIdCl)] },
                    { $in: [ObjectId(userIdCl), "$$child.members"] },
                  ]
                }
              }
            },
            "editors": "$collectionData.editors",
            "post.userName": "$userName",
            "post.userId": "$userId",
            "post.timestamp": "$timestamp",
            "post.text": "$text"
          }
        },
        {
          $match: { 'post.collectionData': { $ne: [] } }
        },
        {
          $project: {
            "post._id": 1,
            "post.isReplyTo": 1,
            "post.replies": 1,
            "post.featureData": 1,
            "post.collectionData._id": 1,
            "post.collectionData.description": 1,
            "post.collectionData.title": 1,
            "post.collectionData.user": 1,
            "post.collectionData.username": 1,
            "post.collectionData.visibility": 1,
            "post.collectionData.members": 1,
            "editors": 1,
            "post.collectionData.isEditor": {
              $cond: {
                if: {
                  $or: [
                    { $in: [ObjectId(userIdCl), "$editors"] },
                    // { $eq: [userIdCl, "$post.userId"] },
                    { $eq: [ObjectId(userIdCl), { $arrayElemAt: ["$post.collectionData.user", 0] }] }
                  ]
                },
                then: true,
                else: false
              }
            },
            "post.userName": 1,
            "post.userId": 1,
            "post.timestamp": 1,
            "post.text": 1
          }
        },
        {
          $sort: { 'post.timestamp': -1 }
        },
        {
          $group: {
            _id: "$post.isReplyTo",
            posts: { $push: "$post" },
          }
        },
        {
          $project: {
            posts: 1,
            count: { $size: "$posts" }
          }
        },
        {
          $sort: { 'posts.timestamp': -1 }
        },
        {
          $project: {
            count: 1,
            posts: {
              $switch: {
                branches: [
                  {
                    case: { $gt: ["$count", 4] }, then: {
                      $concatArrays: [{
                        $slice: ["$posts", {
                          $subtract: ["$count", 1]
                        }, "$count"]
                      },
                      { $slice: ["$posts", 0, 4] }]
                    }
                  },
                  {
                    case: { $and: [{ $lt: ["$count", 4] }, { $gt: ["$count", 1] }] }, then: {
                      $concatArrays: [{
                        $slice: ["$posts", {
                          $subtract: ["$count", 1]
                        }, "$count"]
                      },
                      { $slice: ["$posts", 0, { $subtract: ["$count", 1] }] }
                      ]
                    }
                  },
                ],
                default: { $slice: ["$posts", 0, "$count"] }
              }
            }
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
        res.status(200).json(content);
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

router.route('/feature')
  .get(function getSpecificPost(req, res) {
    const Database = require('../Database')
    , dbUrl = 'mongodb://' + config.mongodbHost + config.dbName
    // var start = parseInt(req.query.start);
    // var end = parseInt(req.query.end);
    var userId = req.query.userId;
    var mongoId = req.query.mongoId;
    // console.log(mongoId, userId, start, end);

    const database = new Database(dbUrl);
    database.connect()
      .then((post) => { 
        return post = database.findPostsUsingFeature(mongoId);
      })
      .then((post) => {
        console.log('post in then for aggregate::', post);
        let thread;
        if (post) {
          thread = database.createThreadFromIsReplyTo(post[0].isReplyTo, userId);
        }
        return thread;
      })
      .then((thread) => {
        res.send(thread)
        database.close();
      })
      .catch((err) => {
        if (err){
          console.log(err);
        }
      });
});

router.route('/search')
  .get(function getposts(req, res) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
    var userId = req.query.userId;
    var searchTerm = req.query.keyword;
    var regexValue = '.*' + searchTerm + '.*';
    console.log(start, end, userId, searchTerm, regexValue);
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        var collection = db.collection('posts');
        return collection.aggregate([
          {
            $graphLookup: {
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
              startWith: "$collection",
              connectFromField: "collection",
              connectToField: "_id",
              as: "collectionData",
            }
          },
          {
            $project: {
              "post._id": "$_id",
              "post.isReplyTo": "$isReplyTo",
              "post.replies": "$replies",
              "post.featureData": "$featureData",
              "post.collectionData": {
                "$filter": {
                  "input": "$collectionData",
                  "as": "child",
                  "cond": {
                    $or: [
                      { "$eq": ["$$child.visibility", "public"] },
                      { "$eq": ["$$child.user", ObjectId(userId)] },
                      { $in: [ObjectId(userId), "$$child.members"] },
                    ]
                  }
                }
              },
              "editors": "$collectionData.editors",
              "post.userName": "$userName",
              "post.userId": "$userId",
              "post.timestamp": "$timestamp",
              "post.text": "$text"
            }
          },
          {
            $project: {
              "post._id": 1,
              "post.isReplyTo": 1,
              "post.replies": 1,
              "post.featureData": 1,
              "post.collectionData._id": 1,
              "post.collectionData.description": 1,
              "post.collectionData.title": 1,
              "post.collectionData.user": 1,
              "post.collectionData.username": 1,
              "post.collectionData.visibility": 1,
              "post.collectionData.members": 1,
              "editors": 1,
              "post.collectionData.isEditor": {
                $cond: {
                  if: {
                    $or: [
                      { $in: [ObjectId(userId), "$editors"] },
                      // { $eq: [userId, "$post.userId"] },
                      { $eq: [ObjectId(userId), { $arrayElemAt: ["$post.collectionData.user", 0] }] }
                    ]
                  },
                  then: true,
                  else: false
                }
              },
              "post.userName": 1,
              "post.userId": 1,
              "post.timestamp": 1,
              "post.text": 1
            }
          },
          {
            $match: {
              $and: [
                {
                  'post.text': { $regex: regexValue, '$options': 'i' }
                }
              ]
            }
          },
          {
            $sort: { 'post.timestamp': -1 }
          },
          {
            $group: {
              _id: "$post.isReplyTo",
              posts: { $push: "$post" },
            }
          },
          {
            $project: {
              posts: 1,
              count: { $size: "$posts" }
            }
          },
          {
            $sort: { 'posts.timestamp': -1 }
          },
          {
            $project: {
              count: 1,
              posts: { $switch: {
                branches: [
                  { case: { $gt: [ "$count", 4 ] }, then: {
                      $concatArrays: [{
                        $slice: ["$posts", {
                          $subtract: ["$count", 1]
                        }, "$count"]
                      },
                      { $slice: ["$posts", 0, 4] }]
                    }
                  },
                  { case: { $and : [{$lt: [ "$count", 4 ]}, {$gt: [ "$count", 1 ]} ]}, then: {
                      $concatArrays: [{
                        $slice: ["$posts", {
                          $subtract: ["$count", 1]
                        }, "$count"]
                      },
                      { $slice: ["$posts", 0, { $subtract: ["$count", 1] }] }
                    ]}
                  },
                ],
                default: { $slice: ["$posts", 0, "$count"] }
             }}}},
          // {
          //   $skip: start
          // },
          // {
          //   $limit: end
          // }
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


module.exports = router;
