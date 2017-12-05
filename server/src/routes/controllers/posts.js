var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../../config');

router.route('/')
 .post(function setpost(req, res) {
   MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
     console.log(req.body.text);
     var post = {
       userId: req.body.userId,
       userName: req.body.userName,
       timestamp: req.body.timestamp,
       text: req.body.text,
       relatedGeodata: req.body.relatedGeodata,
       userFeatures: req.body.userFeatures,
       isReplyTo: req.body.isReplyTo,
       group: req.body.group
     };
     if (err) {
       throw err;
     } else {
       db.collection('posts').insertOne(
        post
       );
       res.status(200).send();
     }
     db.close();
   });
 });

router.route('/all')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      // Create your schemas and models here.
      var collection = db.collection('posts');
      var start = parseInt(req.query.start);
      var end = parseInt(req.query.end);
      // console.log('This call will show ' + page);
      if (err) {
        throw err;
      }
      collection.aggregate([
        {
          $match: {'isReplyTo': ''}
        }
        ,
        { 
          $sort: { 'timestamp': -1 } 
        },
        { 
          $skip : start
        },
        { 
          $limit : end 
        },
        {
          $lookup:
        {
          from: "posts",
          localField: "replies",
          foreignField: "_id",
          as: "repliesData"
        }
      }]).toArray(function handleCursor(error, docs) {
        if (err) {
          res.sendStatus(500);
          console.log(error);
        } else {
          console.log(docs);
          res.send(docs);
          db.close();
        }
      });
    });
  });

router.route('/person')
.get(function getPersonsPosts(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var userName;
      userName = req.query.userName;
      console.log(userName);
      var collection = db.collection('posts');
      var regexValue = '.*' + userName + '.*';
      if (err) {
        throw err;
      }
      collection.find({ text: { $regex : regexValue } }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
            // console.log(error);
          } else {
            // console.log(docs);
            res.send(docs);
            db.close();
          }
        });
    });
});
router.route('/hashtag')
.get(function getHashtagPosts(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var hashtag;
      hashtag = req.query.hashtag;
      var collection = db.collection('posts');
      var regexValue = '.*' + hashtag + '.*';
      if (err) {
        throw err;
      }
      collection.find({ text: { $regex : regexValue } }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
            console.log(error);
          } else {
            console.log(docs);
            res.send(docs);
            db.close();
          }
        });
    });
});

router.route('/relations')
.get(function getRelations(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var relationId = [];
      var collection = db.collection('posts');

      if (typeof req.query.id === 'object') {
        req.query.id.forEach(function makeIdArray(i) {
          relationId.push(i);
        });
      } else {
        relationId.push(req.query.id);
      }

      console.log(relationId);

      if (err) {
        throw err;
      }
      collection.find({ relatedGeodata: { $in: relationId } }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
            console.log(error);
          } else {
            console.log(docs);
            res.send(docs);
            db.close();
          }
        });
    });
});
router.route('/responses')
.get(function getResponses(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var responseId = [];
      var collection = db.collection('posts');
      responseId = req.query.responseId;
      if (err) {
        throw err;
      }
      collection.find({ isReplyTo: responseId }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
          } else {
            res.send(docs);
            db.close();
          }
        });
    });
});

router.route('/personalTl')
.get(function getPersonsPosts(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var userName;
      userName = req.query.userName;
      console.log(userName);
      var collection = db.collection('posts');
      console.log(typeof userName);

      if (err) {
        throw err;
      }
      collection.find({ userName: userName }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
            // console.log(error);
          } else {
            // console.log(docs);
            res.send(docs);
            db.close();
          }
        });
    });
});

router.route('/feature')
.get(function getPersonsPosts(req, res) {
   // db.posts.findOne({"text" : {$regex : ".*myron.*"}});
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      // Create your schemas and models here.
      var featureId;
      featureId = req.query.featureId;
      console.log(featureId);
      var collection = db.collection('posts');
      var regexValue = '.*' + featureId + '.*';

      if (err) {
        throw err;
      }
      collection.find({ userFeatures: { $regex : regexValue } }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
            // console.log(error);
          } else {
            // console.log(docs);
            res.send(docs);
            db.close();
          }
        });
    });
});

router.route('/search')
.get(function getHashtagPosts(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var term;
      term = req.query.term;
      var collection = db.collection('posts');
      collection.createIndex({text: 'text'});

      if (err) {
        throw err;
      }
      collection.find({ $text: { $search: term } }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
          } else {
            console.log(docs);
            res.send(docs);
            db.close();
          }
        });
    });
});

router.route('/group')
.get(function getHashtagPosts(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var term;
      var collection = db.collection('posts');
      term = req.query.term;

      if (err) {
        throw err;
      }
      collection.find({ group: term }).toArray(
        function handleCursor(error, docs) {
          if (err) {
            res.sendStatus(500);
          } else {
            res.send(docs);
            db.close();
          }
        });
    });
});

router.route('/allGeodata')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var collection = db.collection('posts');
      if (err) {
        throw err;
      }
      collection.find({}, { userFeatures: 1 }).toArray(function handleCursor(error, docs) {
        if (err) {
          res.sendStatus(500);
          console.log(error);
        } else {
          console.log(docs);
          res.send(docs);
          db.close();
        }
      });
    });
  });

module.exports = router;
