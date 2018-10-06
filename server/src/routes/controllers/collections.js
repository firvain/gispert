// import { ObjectId } from './C:/Users/Yiannis/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/bson';

var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

router.route('/')
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
                    { visibility: 'private' },
                    { user: ObjectID(userId) }
                  ]
                },
                {
                  $and: [
                    { visibility: 'private' },
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
  })
  .post(function setcollection(req, res) {
      MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
          var newCollection = req.body.newCollection;
          newCollection.user = ObjectID(req.body.newCollection.user);
          newCollection.members = [];
          newCollection.editors = [];
          newCollection.timestamp = new Date();
          // console.log(req.body);
          console.log('a new collection:: ', newCollection);
          if (err) {
              throw err;
          } else {
              db.collection('collections').insertOne(
                  newCollection
              );
              res.status(200).send(newCollection);
          }
          db.close();
      });
  });

router.route('/delete')
  .post(function setuser(req, res) {
      MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
          var _id = req.body.id;
          var cId = new ObjectID(_id);
          // console.log('collection id to delete:: ', req.body._id);

          if (err) {
              throw err;
          } else {
              db.collection('collections').remove({
                  _id: cId 
              });
              db.collection('posts').deleteMany({
                  collection : cId
              });
              res.status(200).send('OK');
          }
          db.close();
      });
  });

router.route('/collection')
.get(function getposts(req, res) {
  var start = parseInt(req.query.start);
  var end = parseInt(req.query.end);
  var userId = req.query.userId;
  var collectionId = req.query.collectionId;
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
                      "post.collectionData": "$collectionData",
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
                          { $in: [[ObjectID(userId)], "$editors"] },
                        //   { $eq: [userId, "$post.userId"] },
                          { $eq: [ObjectID(userId), { $arrayElemAt: ["$post.collectionData.user", 0] }] }
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
                    { 'post.collectionData._id': ObjectID(collectionId) },
                    {
                      $or: [
                        { "post.collectionData.members": ObjectID(userId) },
                        { "post.collectionData.user": ObjectID(userId) },
                        { "post.collectionData.visibility": 'public' }
                      ]
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

    router.route('/setMembership')
    .post(function setMembership(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            const userId = req.body.data.memberId;
            const collectionsToFollow = req.body.data.collectionsToFollow;
            const collectionsToUnfollow = req.body.data.collectionsToUnfollow;
            console.log('data:: ', req.body.data);
            // console.log('adding user to collection:: ', userId, collectionsId);
            const id = new ObjectID(userId);

            var cidsToFollow = [];
            collectionsToFollow.forEach((id) => {
                cidsToFollow.push(new ObjectID(id));
            });
            var cidsToUnfollow = [];
            collectionsToUnfollow.forEach((id) => {
                cidsToUnfollow.push(new ObjectID(id));
            });
            console.log('follow unfollow cids:: ', cidsToFollow, cidsToUnfollow);

            if (err) {
                throw err;
            } else {
                db.collection('collections').updateMany(
                    { _id: { $in: cidsToFollow } },
                    { $addToSet: { members:  id } }
                );
                db.collection('collections').updateMany(
                    { _id: { $in: cidsToUnfollow} },
                    { $pull: { members:  id } }
                );
                db.collection('collections').updateMany(
                    { _id: { $in: cidsToUnfollow } },
                    { $pull: { editors: id } }
                );

                cidsToFollow.forEach((cid) => {
                    db.collection('notifications').insertOne({ 
                        collectionId: cid,
                        byUser: id,
                        type: 'followedCollection',
                        userCreated: new ObjectID(req.body.data.userCreated),
                        timestamp: Date.now(),
                        read: 0
                    });
                });
                cidsToUnfollow.forEach((cid) => {
                    db.collection('notifications').insertOne({ 
                        collectionId: cid,
                        byUser: id,
                        type: 'unfollowedCollection',
                        userCreated: new ObjectID(req.body.data.userCreated),
                        timestamp: Date.now(),
                        read: 0
                    });
                });
                res.status(200).send('OK');
            }
            db.close();
        });
    });

    router.route('/unfollow')
    .post(function setuser(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var cid = req.body.data.collectionId;
            console.log('collection id to unfollow:: ', cid);
            var cId = new ObjectID(cid);
            var mid = req.body.data.memberId;
            var force = req.body.data.force;
            console.log('collection id to unfollow:: ', mid);
            var mId = new ObjectID(mid);
            var userCreated = new ObjectID(req.body.data.userCreated);
            // console.log('collection id to delete:: ', req.body._id);
    
            if (err) {
                throw err;
            } else {
                db.collection('collections').update(
                    { _id: cId },
                    { $pull: { members: mId } }
                );
                db.collection('collections').update(
                    { _id: cId },
                    { $pull: { editors: mId } }
                );
                if (!force) {
                    db.collection('notifications').insertOne({ 
                        collectionId: cId,
                        byUser: mId,
                        type: 'unfollowedCollection',
                        userCreated: userCreated,
                        timestamp: Date.now(),
                        read: 0
                    });
                }
                res.status(200).send('OK');
            }
            db.close();
        });
    });        


router.route('/search')
    .get(function getmemberscollection(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
            .then(function (db) {
                var userId = req.query.userId;
                var keyword = req.query.keyword;
                // console.log('get type:: ', type);
                var collection = db.collection('collections');

                return collection.aggregate([
                    {
                        $match: {
                            $and: [
                                { title: { $regex: ".*" + keyword + ".*", '$options': 'i' } },
                                {
                                    $or: [
                                        {
                                            visibility: 'public'
                                        },
                                        {
                                            $and: [
                                                { visibility: 'private' },
                                                { user: ObjectID(userId) }
                                            ]
                                        }
                                    ]
                            }] 
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
                            // members: 1,
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
                    }, 
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


    // router.route('/search')
    // .get(function searchcollections(req, res) {
    //     MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
    //         var userId = req.query.userId;
    //         var keyword = req.query.keyword;
    //         // console.log('get type:: ', type);
    //         var collection = db.collection('collections');
    //         if (err) {
    //             console.log(err);
    //         }
    //         if (userId) {
    //             // collection.find({ user: ObjectID(userId) }).toArray(function handleCursor(error, docs) {
    //             collection.find({
    //                 $and: [
    //                 {title: {$regex : ".*"+keyword+".*", '$options' : 'i'}},
    //                 {$or: [
    //                     { 
    //                         visibility: 'public'
    //                     },
    //                     {
    //                         $and: [
    //                             { visibility: 'private' }, 
    //                             { user: ObjectID(userId) }
    //                         ]
    //                     }
    //                 ]}] }
    //                 ,
    //                 // {
    //                     // $project: {
    //                     //     _id: 1,
    //                     //     title: 1,
    //                     //     description: 1,
    //                     //     visibility: 1,
    //                     //     user: 1,
    //                     //     username: 1,
    //                     //     members: 1,
    //                         // isEditor: {
    //                         //     $cond: {
    //                         //         if: {
    //                         //             $or: [
    //                         //                 { $in: [ObjectID(userId), "$editors"] },
    //                         //                 //   { $eq: [ObjectID(userId), "$editors"] },
    //                         //                 { $eq: [ObjectID(userId), "$user"] }
    //                         //             ]
    //                         //         },
    //                         //         then: true,
    //                         //         else: false
    //                         //     }
    //                         // },
    //                         // isMember: {
    //                         //     $cond: {
    //                         //         if: {
    //                         //             $and: [
    //                         //                 { $in: [ObjectID(userId), "$members"] },
    //                         //             ]
    //                         //         },
    //                         //         then: true,
    //                         //         else: false
    //                         //     }
    //                         // }
    //                     // }
    //                 // }, 
    //                 {}).toArray(function handleCursor(error, docs) {
    //                 // console.log(docs);
    //                 var data = {};
    //                 if (err) {
    //                     res.sendStatus(500);
    //                     console.log(error);
    //                 } else {
    //                     res.send(docs);
    //                     db.close();
    //                 }
    //             });
    //         }
    //     });
    // });


router.route('/members')
    .get(function getmemberscollection(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
          const collectionId = req.query.collectionId;
          const userId = req.query.userId;
          var collection = db.collection('collections');

          return collection.aggregate([
            { $match: {_id: ObjectID(collectionId) } },
           {
               $graphLookup: {
                   from: "users",
                   startWith: "$members",
                   connectFromField: "members",
                   connectToField: "_id",
                   as: "users",
               }
           },
           {$project: {
               "users._id": 1,
               "users.name":1
               }}
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

router.route('/editors')
    .get(function getmemberscollection(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
          const collectionId = req.query.collectionId;
          const userId = req.query.userId;
          var collection = db.collection('collections');

          return collection.aggregate([
            { $match: {_id: ObjectID(collectionId) } },
           {
               $graphLookup: {
                   from: "users",
                   startWith: "$editors",
                   connectFromField: "editors",
                   connectToField: "_id",
                   as: "users",
               }
           },
           {$project: {
               "users._id": 1,
               "users.name":1
            }}
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


router.route('/setEditor')
  .post(function setuser(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        const collectionId = req.body.data.collectionId;
        const userId = req.body.data.userId;
        console.log('adding editor:: ', userId, collectionId);
        var collection = db.collection('collections');

        return collection.update(
          { _id: ObjectID(collectionId) },
          { $push: { editors: ObjectID(userId) } });
        db.close();
      })
      .then(() => {
        res.sendStatus(200);
      })
      .catch(function (err) {
        throw err;
      });
  });

router.route('/removeEditor')
  .post(function setuser(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        const collectionId = req.body.data.collectionId;
        const userId = req.body.data.userId;
        console.log('removing editor:: ', userId, collectionId);
        var collection = db.collection('collections');

        return collection.update(
          { _id: ObjectID(collectionId) },
          { $pull: { editors: ObjectID(userId) } });
        db.close();
      })
      .then(() => {
        res.sendStatus(200);
      })
      .catch(function (err) {
        throw err;
      });
  });

module.exports = router;
