var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('../../config');

const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

function hashPassword(user, options) {
  const SALT_FACTOR = 8;
  if (!user.changed('password')) {
    return;
  }
  return bcrypt
    .genSaltAsync(SALT_FACTOR)
    .then(salt => bcrypt.hashAsync(user.password, salt, null))
    .then(hash => {
      user.setDataValue('pass', hash)
    });
}

router.route('/')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var name = req.query.name;
      if (err) {
        throw err;
      }
      db.collection('users').aggregate([
        { $match: { name: name } }
      ]
        , function handleCursor(error, user) {
          if (error) {
            res.status(500).send({
              error: 'something blew up'
            });
          } else {
            res.send(user);
          }
          db.close();
        });
    });
  });

router.route('/all')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        // console.log(db)
        const liveMapUsers = db.collection('liveMapUsers');
        const allUsers = db.collection('users');
        const start = parseInt(req.query.pageFrom);
        const end = parseInt(req.query.pageTo);
        const userId = req.query.userId;
        liveMapUsers.findOne({
          "_id" : ObjectID(userId)
        }).then((res) => {
            console.log(res);
            let following = [];
            res.liveUsers.forEach((u) => {
              following.push(ObjectID(u))
        });
        return following;
        }).then((following) => {
          console.log('following:: ', following);
          allUsers.aggregate([
            { "$project": {
              "_id": 1,
              "name": 1,
              "description": 1,
              "showLive" : { $cond: [{ $in: [ "$_id", following ] }, true , false ]} 
            }},
            {
              $match: {"_id" : { $ne: ObjectID(userId) }}
            },
            {
              $skip: start
            },
            {
              $limit: end
            }
          ], function handleCursor(err, docs) {
            if (err) { throw err} else {
              res.send(docs);
            }
          });
          db.close();
        })
        .catch(function (err) {
          throw err;
        });;
      })
      .catch(function (err) {
        throw err;
      });
  });

router.route('/updateprofile')
  .post(function update(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var currentUserId;
      var cId;
      var description = req.body.updateInfo.description;
      var email = req.body.updateInfo.email;

      currentUserId = req.body.updateInfo.id;
      cId = new ObjectID(currentUserId);
      console.log('updating user profile:: ', currentUserId, email, description);
      if (err) {
        throw err;
      } else {
        db.collection('users').update(
          { _id: cId },
          { $set: { description: description, email: email } }
        );
        res.status(200).send();
      }
      db.close();
    });
  });



  router.route('/search')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName)
      .then(function (db) {
        // console.log(db)
        const liveMapUsers = db.collection('liveMapUsers');
        const allUsers = db.collection('users');
        // const start = parseInt(req.query.pageFrom);
        // const end = parseInt(req.query.pageTo);
        const userId = req.query.userId;
        const keyword = req.query.keyword;

        liveMapUsers.findOne({
          "_id" : ObjectID(userId)
        }).then((res) => {
            console.log(res);
            let following = [];
            res.liveUsers.forEach((u) => {
              following.push(ObjectID(u))
        });
        return following;
        }).then((following) => {
          console.log('following:: ', following);
          allUsers.aggregate([
            { "$project": {
              "_id": 1,
              "name": 1,
              "description": 1,
              "showLive" : { $cond: [{ $in: [ "$_id", following ] }, true , false ]} 
            }},
            {
              $match: {"_id" : { $ne: ObjectID(userId) }}
            },
            {
              $match: {name: {$regex : ".*"+keyword+".*", '$options' : 'i'}}
            }
          ], function handleCursor(err, docs) {
            if (err) { throw err} else {
              res.send(docs);
            }
          });
          db.close();
        })
        .catch(function (err) {
          throw err;
        });;
      })
      .catch(function (err) {
        throw err;
      });
  });


  // router.route('/search')
  // .get(function getusers(req, res) {
  //   MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
  //     var collection = db.collection('users');
  //     var keyword = req.query.keyword;

  //     if (err) {
  //       throw err;
  //     } else {
  //       collection.aggregate([
  //         {
  //           $match: {name: {$regex : ".*"+keyword+".*", '$options' : 'i'}},
  //         },
  //         {
  //           $graphLookup: {
  //             from: "collections",
  //             startWith: "$_id",
  //             connectFromField: "_id",
  //             connectToField: "user",
  //             as: "collectionData",
  //           }
  //         },{ "$project": {
  //             "_id": 1,
  //             "name": 1,
  //             "description": 1,
  //             "collectionData": {
  //                "$filter": {
  //                    "input": "$collectionData",
  //                    "as": "child",
  //                    "cond": { $or: [ { "$eq": [ "$$child.visibility", "public" ] }] }
  //                }
  //             }
  //         }}
  //         // ,{
  //         //   $skip: start
  //         // },
  //         // {
  //         //   $limit: end
  //         // }
  //       ], function handleCursor(error, users) {
  //         if (error) {
  //           res.sendStatus(500);
  //           console.log(error);
  //         } else {
  //           // console.log(docs);
  //           res.send(users);
  //           db.close();
  //         }  
  //       })
  //     }
  //   });
  // });


  router.route('/setlocale')
  .post(function update(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const currentUserId = req.body.updateInfo.id;
      const locale = req.body.updateInfo.locale;
      cId = new ObjectID(currentUserId);
      // console.log('updating user profile:: ', currentUserId, email, description);

      if (err) {
        throw err;
      } else {
        db.collection('users').update(
          { _id: cId },
          { $set: { locale: locale } }
        );
        res.sendStatus(200);
      }
      db.close();
    });
  });

  
  router.route('/collectionsOfUser')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const userId = req.query.userId;
      const memberId = req.query.memberId;
      var collection = db.collection('collections');
      if (err) {
        throw err;
      } else {
        console.log('user id::', userId);
        collection.find(
          {
            $and: [
              { user: ObjectID(userId) },
              { $or: [
                { visibility: 'public' },
                { members: ObjectID(memberId) }
              ]}
            ]
          }).toArray(
            function handleCursor(error, collections) {
              if (error) {
                res.sendStatus(500);
                console.log(error);
              } else {
                // console.log(docs);
                res.send(collections);
                db.close();
              }  
            });
      }
    });
  });


router.route('/usersToChatWith')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const userId = req.query.userId;
      var collection = db.collection('collections');
      if (err) {
        throw err;
      } else {
        collection.aggregate([
          { $match: { 
            $or: [
              { members: ObjectID(userId) }
            ]
          } },
          { "$group": { "_id": { user: "$user", username: "$username" } } }
        ], function handleCursor(error, users) {
          if (error) {
            res.sendStatus(500);
            console.log(error);
          } else {
            // console.log(docs);
            res.send(users);
            db.close();
          }
        });
      }
    });
  });


  router.route('/LiveMapChatForUser')
  .post(function set(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const currentUserId = req.body.data.id;
      const cId = new ObjectID(currentUserId);
      const liveUserId = req.body.data.liveId;
      const livecId = new ObjectID(liveUserId);

      console.log('live user add:: ', currentUserId, livecId);
      if (err) {
        throw err;
      } else {
        db.collection('liveMapUsers').update(
          { _id: cId },
          { $push: { liveUsers: livecId } },
          { upsert : true }
        );
        res.sendStatus(200);
      }
      db.close();
    });
  })
  .get(function get(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const currentUserId = req.query.id;
      const cId = new ObjectID(currentUserId);

      console.log('live user get:: ', currentUserId);
      if (err) {
        throw err;
      } else {
        db.collection('liveMapUsers').find(
          { _id: cId }
        ).toArray(function handleCursor(error, docs) {
          if (error) {
            res.sendStatus(500);
            console.log(error);
          } else {
            // console.log(docs);
            res.send(docs);
            db.close();
          }
        });
      }
      db.close();
    });    
  });

  router.route('/removeLiveMapChatForUser')
  .post(function set(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      const currentUserId = req.body.data.id;
      const cId = new ObjectID(currentUserId);
      const liveUserId = req.body.data.liveId;
      const livecId = new ObjectID(liveUserId);

      console.log('live user remove:: ', currentUserId, livecId);
      if (err) {
        throw err;
      } else {
        db.collection('liveMapUsers').update(
          { _id: cId },
          { $pull: { liveUsers: livecId } }
        );
        res.sendStatus(200);
      }
      db.close();
    });
  });


module.exports = router;