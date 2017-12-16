const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const io = require('socket.io')();
const app = express();


app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const APIv1 = require('./routes/APIv1');
app.use('/v1', APIv1);

app.io = io;

io.on('connection', function(socket) {
    var userAdded = false;
    console.log('Someone connected');
    socket.on('chat message', function handlemsg(msg) {
      io.emit('chat message', msg);
    });
    socket.on('refreshPosts', function handlepost(post) {
      io.emit('newPost', post);
    });
    socket.on('refreshGroups', function handlegroup(group) {
      io.emit('newGroup', group);
    });
    socket.on('groupDeleted', function handlegroup(group) {
      io.emit('groupDeleted', group);
    });
    socket.on('style', function handlestyle(f) {
      console.log(f);
      io.emit('style', f);
    });
    socket.on('refreshLayers', function handlelayer(layer) {
      io.emit('newLayer', layer);
    });
    socket.on('newFeature', function handlefeature(f) {
      io.emit('drawFeature', f);
      console.log(f);
    });
    socket.on('feature message', function handlemessage(msg) {
      io.emit('newFeatureMessage', msg);
    });
    socket.on('userConnected', function handleUserConnection(userid) {
      socket.userid = userid;
      userAdded = true;
      userList.push(userid);
      io.emit('refreshUserList', userList);
      console.log('userList is:');
      console.log(userList);
    });
    socket.on('disconnect', function handleUserConnection() {
      var index = userList.indexOf(socket.userid);    // <-- Not supported in <IE9
      if (index !== -1) {
        userList.splice(index, 1);
      }
      io.emit('refreshUserList', userList);
      console.log('user disconnected: ' + socket.userid);
    });
  });

app.listen(process.env.PORT || 8081);
