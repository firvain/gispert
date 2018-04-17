var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);



// const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// const io = require('socket.io')();
// const app = express();

var config = require('./config');
var jwt    = require('jsonwebtoken');

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('superSecret', config.secret);

// const APIv1 = require('./routes/APIv1');
// app.use('/v1', APIv1);
const APIsecure = require('./routes/APIv2');
app.use('/v1', APIsecure);

app.use(function (req, res, next) {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});

// app.io = io;
io.set('origins', '*:*');
const userList = [];
io.on('connection', function(socket) {
    // var userAdded = false;
    console.log('Someone connected');
    // socket.on('chat message', function handlemsg(msg) {
    //   io.emit('chat message', msg);
    // });
    socket.on('newPost', function handlepost(post) {
      io.emit('newPost', post);
      console.log('Received a socket request and emitting new post');
    });
    socket.on('newReply', function handlepost(post) {
      io.emit('newReply', post);
      console.log('Received a socket request and emitting reply');
    });
    // socket.on('refreshGroups', function handlegroup(group) {
    //   io.emit('newGroup', group);
    // });
    // socket.on('groupDeleted', function handlegroup(group) {
    //   io.emit('groupDeleted', group);
    // });
    // socket.on('style', function handlestyle(f) {
    //   console.log(f);
    //   io.emit('style', f);
    // });
    // socket.on('refreshLayers', function handlelayer(layer) {
    //   io.emit('newLayer', layer);
    // });
    // socket.on('newFeature', function handlefeature(f) {
    //   io.emit('drawFeature', f);
    //   console.log(f);
    // });
    socket.on('featureMessage', function handlemessage(msg) {
      io.emit('newFeatureMessage', msg);
    });
    socket.on('unfollowedCollection', function handleunfollow(data) {
      // io.emit('unfollowedCollection', data);
      console.log('unfollow userList is:', userList, data);
      const toid = userList.filter(user => user.user_id === data.userCreated);
      // console.log('sending to user:', toid, 'filter::', data.userCreated);
      if (toid.length > 0) {
        // console.log('socket id:: ', toid[0].id);
        socket.broadcast.to(toid[0].id).emit('unfollowedCollection',{
          byUser: data.memberId, // eslint-disable-line no-underscore-dangle
          unfollowedId: data.collectionId,
          userCreated: data.userCreated,
          read: 0,
          type: 'unfollowedCollection',
        });
      }
    });
    socket.on('followedCollection', function handlefollow(data) {
      console.log('follow userList is:', userList, data);
      const toid = userList.filter(user => user.user_id === data.userCreated);
      console.log('sending to user:', toid, 'filter::', data.userCreated);
      if (toid.length > 0) {
        // console.log('socket id:: ', toid[0].id);
        const msg = {
          byUser: data.memberId, // eslint-disable-line no-underscore-dangle
          unfollowedId: data.collectionsId,
          userCreated: data.userCreated,
          read: 0,
          type: 'followedCollection',
        }
        console.log('follow message:: ', msg);
        socket.broadcast.to(toid[0].id).emit('followedCollection', msg);
      }
    });
    socket.on('userConnected', function handleUserConnection(userid) {
      const user = {
        id: socket.id,
        user_id: userid,
      };
      // userAdded = true;
      userList.push(user);
      // io.emit('refreshUserList', userList);
      console.log('userList is:', userList);
      // console.log('socket id::', socket.userid);
    });
    // socket.on('disconnect', function handleUserConnection() {
    //   console.log('socket id to disconnect::', socket.userid);
    //   var index = userList.indexOf(socket.userid);    // <-- Not supported in <IE9
    //   if (index !== -1) {
    //     userList.splice(index, 1);
    //   }
    //   io.emit('refreshUserList', userList);
    //   console.log('user disconnected: ' + socket.userid);
    // });
  });

// app.listen(process.env.PORT || 8081);
server.listen(8081);
