// const APIhost = 'localhost';
// const APIhostPort = '8081';
// const APIversion = 'v1';
// const APIhttpType = 'http';
// const hostPost = '8080';
// const appUrl = `${APIhttpType}://${APIhost}:${APIhostPort}/${APIversion}`;
// const socketUrl = `${APIhttpType}://${APIhost}:${APIhostPort}`;
// const shareUrl = `${APIhttpType}://${APIhost}:${hostPost}`;

// const facebook_id = '';
// const google_id = '';

const APIhost = 'geobabel.herokuapp.com';
const APIversion = 'v1';
const APIhttpType = 'https';
const appUrl = `${APIhttpType}://${APIhost}/${APIversion}`;
const socketUrl = `${APIhttpType}://${APIhost}`;
const shareUrl = `${APIhttpType}://${APIhost}`;

module.exports = {
  url: appUrl,
  surl: socketUrl,
  share: shareUrl,
};
