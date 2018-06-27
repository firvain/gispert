const APIhost = 'localhost';
const APIhostPort = '8081';
const APIversion = 'v1';
const APIhttpType = 'http';
// const hostPost = '8080';
// const google_id = '';
// const facebook_id = '';

const appUrl = `${APIhttpType}://${APIhost}:${APIhostPort}/${APIversion}`;
const socketUrl = `${APIhttpType}://${APIhost}:${APIhostPort}`;
const shareUrl = `${APIhttpType}://${APIhost}:${APIhostPort}`;

module.exports = {
  url: appUrl,
  surl: socketUrl,
  share: shareUrl,
};
