var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));
const moment = require('moment');

var MongoClient = require('mongodb').MongoClient;
const config = require('../../config');

// https://scotch.io/tutorials/easy-node-authentication-facebook
// https://scotch.io/tutorials/easy-node-authentication-google

function hashPassword(user) {
  console.log('hash password');
  const SALT_FACTOR = 8;
  let hashed;
  bcrypt
    .genSaltAsync(SALT_FACTOR)
    .then(salt => bcrypt.hashAsync(user.pass, salt, null))
    .then(hash => {
      user['pass'] = hash;
      console.log('hashed is:: ', hash);
      console.log('user hashed is:: ', user['pass']);
      console.log('new User :: ', user);
      return user;
    });
}

router.route('/')
  .get(function getusers(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      var name = req.query.name;
      var password = bcrypt.hashSync(req.query.password, '$2a$04$thisisasaltthisisasaleDjUpLNqciaokdZZwyr82a58CUDIz/Se');
      // console.log(req.query);
      console.log(name);
      console.log(password);

      if (err) {
        res.send({
          error: 'Login information was incorrect'
        });
      } else {
        var query = { name: req.query.name, pass: password };
        db.collection('users').find(query).toArray(function (err, result) {
          if (err) {
            throw err;
          } else if (result.length == 0) {
            res.send({
              error: 'Login information was incorrect'
            });
            db.close();
          } else {
            const user = result[0];
            user.pass = bcrypt.hashSync(user.pass, '$2a$04$thisisasaltthisisasaleDjUpLNqciaokdZZwyr82a58CUDIz/Se');
            res.send({
              user: user,
              token: jwt.sign({ data: user }, config.secret, { expiresIn: 60 * 60 * 2 })
            });
            db.close();
          }
        });
      }
    });
  })
  .post(function setuser(req, res) {
    MongoClient.connect('mongodb://' + config.mongodbHost + config.dbName, function handleConnection(err, db) {
      userPasswordHashed = bcrypt.hashSync(req.body.password, '$2a$04$thisisasaltthisisasaleDjUpLNqciaokdZZwyr82a58CUDIz/Se');
      const user = {
        name: req.body.name,
        pass: userPasswordHashed,
        email: req.body.email,
        description: req.body.description,
      };
      if (req.body.name.length > 0 && req.body.password.length > 0) {
        console.log('this user is trying to register:: ', user)
        //  console.log(req.body);
        db.collection('users').aggregate([
          { $match: { name: req.body.name } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]).toArray(function handleCursor(err, docs) {
          // console.log('docs is:: ', docs);
          // console.log('count is: ' + docs[0].count);
          console.log(docs);
          if (docs && docs[0] && docs[0].count) {
            console.log('error user exists');
            res.send({ result: 'in use' });
          }
          if (docs.length === 0) {
            // console.log('inserting user');
            // before you insert the user hash the password
            // user.pass = bcrypt.hashSync(user.pass, '$2a$04$thisisasaltthisisasaleDjUpLNqciaokdZZwyr82a58CUDIz/Se');
            db.collection('users').insertOne(
              user
            );
            db.collection('collections').insertOne({
              title: 'Δημόσια Συλλογή',
              description: 'Συλλογή που όλοι μπορούν να δουν',
              visibility: 'public',
            });
            db.collection('collections').insertOne({
              title: 'Προσωπική Συλλογή',
              description: 'Συλλογή που μπορώ να δω μόνο εγώ',
              visibility: 'private',
            });
            // res.status(200).send('success');
            res.send({ result: 'success' });
            db.close();
          }
        });
      }
    });
  });

module.exports = router;