// const APIhost = 'localhost';
// const APIhostPort = '8081';
// const APIversion = 'v1';
// const APIhttpType = 'http';
// const hostPost = '8080';
// const appUrl = `${APIhttpType}://${APIhost}:${APIhostPort}/${APIversion}`;
// const socketUrl = `${APIhttpType}://${APIhost}:${APIhostPort}`;
// const shareUrl = `${APIhttpType}://${APIhost}:${hostPost}`;

const facebookId = '1772053726225880';
const googleId = '512572050910-i2pgo4490eva3qe1asbfv5o9ujmub8pi.apps.googleusercontent.com';
const linkedinId = '86qsfazxbltu7i';

const APIhost = 'geobabel.herokuapp.com';
const APIversion = 'v1';
const APIhttpType = 'https';
const appUrl = `${APIhttpType}://${APIhost}/${APIversion}`;
const socketUrl = `${APIhttpType}://${APIhost}`;
const shareUrl = `${APIhttpType}://${APIhost}/#/app`;

module.exports = {
  url: appUrl,
  surl: socketUrl,
  share: shareUrl,
  facebookId,
  googleId,
  linkedinId,
};
