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

    socket.on('joinCollections', function handleUserConnection(collections) {
      collections.forEach((c) => {
        socket.join(c);
      });
    });

    socket.on('newPost', function handlepost(post) {
      // console.log('new post received from client::', post);
      socket.broadcast.to(post.collections).emit('newPost', post);
    });

    socket.on('newReply', function handlepost(post) {
      // console.log('new reply received from client::', post);
      socket.broadcast.to(post.collections).emit('newReply', post);
    });

    socket.on('inviteToCollection', function handleinvitation(members) {
      const receivers = members;
      receivers.forEach(receiver => {
        const toid = userList.filter(user => user.user_id === receiver);
        console.log('sending invitation to user:', toid, 'filter::', receiver);
        if (toid.length > 0) {
          socket.broadcast.to(toid[0].id).emit('inviteToCollection', 'inviteToCollection');
        }        
      });
    });

    socket.on('featureMessage', function handlemessage(msg) {
      io.emit('newFeatureMessage', msg);
    });

    socket.on('unfollowedCollection', function handleunfollow(data) {
      socket.broadcast.to(data.collectionId).emit('unfollowedCollection', data);
      socket.leave(data.collectionId);
    });

    socket.on('followedCollection', function handlefollow(data) {
      socket.broadcast.to(data.collectionId).emit('followedCollection', data);
      socket.join(data.collectionId);
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
    //   // io.emit('refreshUserList', userList);
    //   console.log('user disconnected: ' + socket.userid);
    // });
  });

// app.listen(process.env.PORT || 8081);
server.listen(8081);
