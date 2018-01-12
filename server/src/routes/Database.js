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

    addPost(post) {
        return new Promise((resolve, reject) => {
                this.db.collection('posts').insertOne(
                post, (err, docs) => {
                    if(err) {
                        console.log('Failed to add post');
                        reject(err)
                    } else {
                        console.log('doc added :: ', docs.insertedId);
                        resolve(docs.insertedId);
                        // insertedid = docs.insertedId;
                    }
                }
            )
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