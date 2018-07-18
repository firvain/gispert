var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var serveStatic = require('serve-static');
var path = require('path');


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
let userList = [];
io.on('connection', function(socket) {
    // var userAdded = false;
    console.log('Someone connected');

    socket.on('joinCollections', function handleUserConnection(collections) {
      console.log('rooms to join:: ', collections);
      collections.forEach((c) => {
        socket.join(c);
      });
    });

    socket.on('leaveCollections', function handleUserConnection(collections) {
      console.log('rooms to leave:: ', collections);
      collections.forEach((c) => {
        socket.leave(c);
      });
    });

    socket.on('newPost', function handlepost(post) {
      console.log('new post received from client::', post);
      socket.broadcast.to(post.collections).emit('newPost', post);
    });

    socket.on('newReply', function handlepost(post) {
      console.log('new reply received from client::', post);
      socket.broadcast.to(post.collections).emit('newReply', post);
    });

    socket.on('inviteToCollection', function handleinvitation(members) {
      console.log('listened to invitation::', members);
      const receivers = members;
      receivers.forEach(receiver => {
        const toid = userList.filter(user => user.user_id === receiver);
        console.log('sending invitation to user:', toid, 'filter::', receiver);
        if (toid.length > 0) {
          socket.broadcast.to(toid[0].id).emit('inviteToCollection', 'inviteToCollection');
        }        
      });
    });

    socket.on('invitationForFeatureChat', function handleConnection(signal) {
      console.log('join feature:: ', signal);
      console.log('join feature:: ', signal.id);
      socket.join(signal.id);
      if (userList.length > 1) {
        signal.receivers.forEach((r) => {
          socketid = userList.find(u => u.user_id === r.user)
          console.log(socketid);
          socket.broadcast.to(socketid.id).emit('invitationForFeatureChat', signal);
        });
      }
    });

    socket.on('joinFeatureChat', function handleUserConnection(join) {
      console.log('join is::', join);
      socket.join(join.fid);
      socket.broadcast.to(join.fid).emit('userJoinedChat', join.user);
    });

    socket.on('featureMessage', function handlemessage(msg) {
      console.log('feature message:: ', msg);
      socket.broadcast.to(msg.userId).emit('newFeatureMessage', msg);
      io.of('/').in(msg.userId).clients((error, clients) => {
        if (error) throw error;
        console.log('clients in this room:: ', clients);
      });
    });

    socket.on('newGeometry', function handlegeometry(msg) {
      console.log('new geometry received from client::', msg);
      socket.broadcast.to(msg.userId).emit('newGeometry', msg);
    });

    socket.on('setSymbology', function handlesymbology(msg) {
      console.log('new symbols received from client::', msg);
      socket.broadcast.to(msg.userId).emit('setSymbology', msg);
    });

    socket.on('unfollowedCollection', function handleunfollow(data) {
      console.log('catched an unfollow::', data);
      socket.broadcast.to(data.collectionId).emit('unfollowedCollection', data);
      socket.leave(data.collectionId);
    });

    socket.on('followedCollection', function handlefollow(data) {
      console.log('catched a follow::', data);
      socket.broadcast.to(data.collectionId).emit('followedCollection', data);
      socket.join(data.collectionId);
    });

    socket.on('removeUserFromCollection', function handleunfollow(data) {
      socket.broadcast.to(data.collectionId).emit('removeUserFromCollection', data);
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

    socket.on('userDisconnected', function handleUserConnection(userid) {
      const toDelete = new Set([userid]);
      const restUsers = userList.filter(obj => !toDelete.has(obj.user_id));
      userList = restUsers;
    });

    socket.on('disconnect', function handleUserConnection() {
      console.log('socket id to disconnect::', socket.id);
      const toDelete = new Set([socket.id]);
      const restUsers = userList.filter(obj => !toDelete.has(obj.id));
      userList = restUsers;
      // console.log('user disconnected: ' + userList);
    });
  });

// app.listen(process.env.PORT || 8081);
// app.use(serveStatic(path.resolve(__dirname, './dist')));
server.listen(process.env.PORT || 8081);
