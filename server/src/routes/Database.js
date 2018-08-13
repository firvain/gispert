'use strict'

const Promise = require('es6-promise').Promise;
const MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

class Database {

    constructor(uri) {
        this.uri = uri
        this.db = {}
        return this
    }

    connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.uri, (err, db) => {
                if (err) reject(err)
                this.db = db
                resolve(this)
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            if(this.db){
                this.db.close();
            }
        })
    }

    addPost(post) {
        return new Promise((resolve, reject) => {
                this.db.collection('posts').insertOne(
                post, (err, docs) => {
                    if(err) {
                        console.log('Failed to add post');
                        reject(err);
                    } else {
                        // console.log('doc added :: ', docs.insertedId);
                        resolve(docs.insertedId);
                        // insertedid = docs.insertedId;
                    }
                }
            )
        })
    }

    addPostFeatures(features) {
        return new Promise((resolve, reject) => {
                this.db.collection('features').insertMany(
                    features, (err, docs) => {
                    if(err) {
                        console.log('Failed to add features');
                        reject(err);
                    } else {
                        // console.log('doc added :: ', docs.insertedId);
                        resolve(docs.insertedId);
                        // insertedid = docs.insertedId;
                    }
                }
            )
        })
    }

    notifyPost(notification) {
        return new Promise((resolve, reject) => {
            console.log('this notification to add in db::', notification);
            this.db.collection('notifications').insertOne(
                notification, (err, docs) => {
                    if(err) {
                        console.log('Failed to add notification:: ', err);
                        reject(err);
                    } else {
                        // console.log('notification added:: ', notification);
                        resolve(docs.insertedId);
                    }
                }
            )
        })
    }

    findRepliedPost(id) {
        console.log('finding creator of post');
        return new Promise((resolve, reject) => {
            this.db.collection('posts').find({
                _id: new ObjectId(id),
            }).toArray(function(err, docs) {
                // console.log(docs);
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  console.log('docs of findRepliedPost:: ', docs);
                  resolve(docs);
                }          
            });
        })
    }

    findCollectionCreator(id) {
        console.log('finding collection creator');
        return new Promise((resolve, reject) => {
            this.db.collection('collections').find({
                _id: new ObjectId(id),
            }).toArray(function(err, docs) {
                console.log('docs:::=->', docs);
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  console.log(docs);
                  resolve(docs);
                }          
            });
        })
    }

    addReply(postId, replyId) {
        console.log('pushing reply to post:: ', postId, replyId);
        return new Promise((resolve, reject) => {
            this.db.collection('posts').update(
                {
                    _id: ObjectId(postId)
                },
                {
                    $push: {
                        replies: ObjectId(replyId)
                    }
                }, function handler(err, doc) {
                    console.log(err);
                }, (err, docs) => {
                   if(err) {
                       reject(err);
                   } else {
                       resolve(docs);
                   }
                }
            );
        })
    }

    setIsReplyTo(postId) {
        console.log('setting post as root:: ', postId);
        return new Promise((resolve, reject) => {
            this.db.collection('posts').update(
                {
                    _id: ObjectId(postId)
                },
                {
                    $set: {
                        isReplyTo: postId
                    }
                }, function handler(err, doc) {
                    console.log(err);
                }, (err, docs) => {
                   if(err) {
                       reject(err);
                   } else {
                       resolve(docs);
                   }
                }
            );
        })
    }

    findPostsUsingFeature(mongoId) {
        console.log('finding posts with this mongoid:: ', mongoId);
        return new Promise((resolve, reject) => {
            this.db.collection('posts').find(
                {
                    userFeatures: mongoId
                }).toArray(function(err, docs) {
                    console.log('docs:::=->', docs);
                    if (err) {
                      console.log(err);
                      reject(err);
                    } else {
                      console.log('found posts for mongoid:: ', docs);
                      resolve(docs);
                    }          
                });
        })
    }

    createThreadFromIsReplyTo(postId, userId, start, end) {
        console.log('creating thread for reply id:: ', postId, userId);
        return new Promise((resolve, reject) => {
            this.db.collection('posts').aggregate(
                [
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
                    //   "post.collectionData": "$collectionData",
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
                    }},
                    {
                      $match: {
                        $and: [
                          { 'post.collectionData': { $ne: [] } },
                          { 'post.isReplyTo': ObjectId(postId) }
                        ]
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
                  ], (err, docs) => {
                   if(err) {
                       reject(err);
                   } else {
                       console.log('thread from promise:: ', docs);
                       resolve(docs);
                   }
                }
            );
        })
    }
}

module.exports = Database;