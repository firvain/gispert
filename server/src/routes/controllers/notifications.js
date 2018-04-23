var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

router.route('/user')
.get(function getposts(req, res) {
  var userId = new ObjectID(req.query.id);
  console.log('getting notifications');
  MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
  .then(function (db) {
    var collection = db.collection('notifications');
    // return collection.find(
    //   { userCreated: userId }
    // );
    return collection.aggregate([
      { $graphLookup: {
          from: "collections",
          startWith: "$collectionId",
          connectFromField: "_id",
          connectToField: "_id",
          as: "collection",
        }
      },
      { $graphLookup: {
          from: "users",
          startWith: "$byUser",
          connectFromField: "_id",
          connectToField: "_id",
          as: "user",
        }
      },
      { $project: {
          "_id": 1,
          "unfolloweId": 1,
          "byUser": 1,
          "type": 1,
          "userCreated": 1,
          "read": 1,
          "collection.title": 1,
          "user.name": 1,
          "membersInvited": 1
      }},
      { $match: {
          $or: [
            {
              membersInvited: userId
            },
            {
              $and: [ 
                { userCreated: userId }, {read: 0}
              ]
            }
          ]
        }
      },
      {
        $limit: 25
      }      
      ]);

      db.close();
    })
    .then(function (cursor) {
      return cursor.toArray();
    })
    .then(function (content) {
      console.log(content);
      res.status(200).json(content);
      // db.close();
    })
    .catch(function (err) {
      throw err;
    });
  });

  router.route('/markAsRead')
    .post(function markAsRead(req, res) {
      MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
          const notificationId = req.body.data.id;
          const id = new ObjectID(notificationId);
          console.log('marking as read :: ', notificationId, id);
          if (err) {
              throw err;
          } else {
              db.collection('notifications').update(
                  { _id: id },
                  { $set: { read: 1 } }
              );
              res.status(200).send('OK');
          }
          db.close();
      });
  });

  router.route('/inviteMembers')
  .post(function savemembers(req, res) {
      MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
          var ids = req.body.data.members;
          var byUser = new ObjectID(req.body.data.byUser);
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
              // db.collection('collections').update(
              //     { _id: cId },
              //     { $set: { members: cids } }
              // );
              db.collection('notifications').insertOne({ 
                  collectionId: cId,
                  byUser: byUser,
                  membersInvited: cids,
                  type: 'invitedToCollection',
                  userCreated: byUser,
                  read: 0
              });
              res.status(200).send('OK');
          }
          db.close();
      });
  });

module.exports = router;