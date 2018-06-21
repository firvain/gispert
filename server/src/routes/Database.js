'use strict'

const Promise = require('es6-promise').Promise;
const MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

class Database {

    constructor(uri) {
        this.uri = uri
        this.db = {}
        return this
    }

    connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.uri, (err, db) => {
                if (err) reject(err)
                this.db = db
                resolve(this)
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            if(this.db){
                this.db.close();
            }
        })
    }

    addPost(post) {
        return new Promise((resolve, reject) => {
                this.db.collection('posts').insertOne(
                post, (err, docs) => {
                    if(err) {
                        console.log('Failed to add post');
                        reject(err);
                    } else {
                        // console.log('doc added :: ', docs.insertedId);
                        resolve(docs.insertedId);
                        // insertedid = docs.insertedId;
                    }
                }
            )
        })
    }

    notifyPost(notification) {
        return new Promise((resolve, reject) => {
            this.db.collection('notifications').insertOne(
                notification, (err, docs) => {
                    if(err) {
                        console.log('Failed to add notification');
                        reject(err);
                    } else {
                        // console.log('notification added:: ', notification);
                        resolve(docs.insertedId);
                    }
                }
            )
        })
    }

    findRepliedPost(id) {
        console.log('finding creator of post');
        return new Promise((resolve, reject) => {
            this.db.collection('posts').find({
                _id: new ObjectId(id),
            }).toArray(function(err, docs) {
                // console.log(docs);
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  console.log('docs of findRepliedPost:: ', docs);
                  resolve(docs);
                }          
            });
        })
    }

    findCollectionCreator(id) {
        console.log('finding collection creator');
        return new Promise((resolve, reject) => {
            this.db.collection('collections').find({
                _id: new ObjectId(id),
            }).toArray(function(err, docs) {
                console.log('docs:::=->', docs);
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  console.log(docs);
                  resolve(docs);
                }          
            });
        })
    }

    addReply(postId, replyId) {
        console.log('pushing reply to post:: ', postId, replyId);
        return new Promise((resolve, reject) => {
            this.db.collection('posts').update(
                {
                    _id: ObjectId(postId)
                },
                {
                    $push: {
                        replies: ObjectId(replyId)
                    }
                }, function handler(err, doc) {
                    console.log(err);
                }, (err, docs) => {
                   if(err) {
                       reject(err);
                   } else {
                       resolve(docs);
                   }
                }
            );
        })
    }
}

module.exports = Database;