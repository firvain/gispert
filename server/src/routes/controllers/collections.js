// import { ObjectId } from './C:/Users/Yiannis/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/bson';

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
                // collection.find({ user: ObjectID(userId) }).toArray(function handleCursor(error, docs) {
                collection.find({ $or: [{ members: ObjectID(userId) },
                    {$and: [{ visibility: 'private' }, { user: ObjectID(userId) }]}] }, {}).toArray(function handleCursor(error, docs) {
                    // console.log(docs);
                    var data = {};
                    if (err) {
                        res.sendStatus(500);
                        console.log(error);
                    } else {
                        // docs.unshift({ title: 'Ιδιωτική Συλλογή', id: userId, user: userId, visibility: 'private', description: 'Συλλογή που μπορείς να δεις μόνο εσύ' });
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
            newCollection.user = ObjectID(req.body.newCollection.user);
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
            // console.log('collection id to delete:: ', req.body._id);

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


router.route('/collection')
.get(function getposts(req, res) {
    var start = parseInt(req.query.start);
    var end = parseInt(req.query.end);
    var userId = req.query.userId;
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
            "collectionData": {
               "$filter": {
                   "input": "$collectionData",
                   "as": "child",
                   "cond": { $or: [ 
                        { "$eq": [ "$$child.visibility", "public" ] }, 
                        { "$eq": [ "$$child.visibility", "private" ] }, 
                        // { "$eq": [ "$$child.user", ObjectID(userId) ] } 
                    ] }
               }
            }
        }},
        { $match: {  
          $and: [
            /*{ 'isReplyTo': '' }, {'collectionData': { $size: 1 }},*/ 
            {'collectionData._id': ObjectID(collectionId) },
            {$or: [{ "collectionData.members": ObjectID(userId) }, { "collectionData.user": ObjectID(userId) }]}
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


    router.route('/savemembers')
    .post(function savemembers(req, res) {
        MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
            var ids = req.body.data.members;
            var collectionid = req.body.data.collectionId;
            var cId = new ObjectID(collectionid);
            var cids = [];
            ids.forEach((id) => {
                cids.push(new ObjectID(id));

            });
            console.log('members:: ', ids, collectionid);

            if (err) {
                throw err;
            } else {
                db.collection('collections').update(
                    { _id: cId },
                    { $push: { members: { $each: cids } } }
                );
                res.status(200).send('OK');
            }
            db.close();
        });
    });

module.exports = router;
