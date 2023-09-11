/**
 * Follow
 */

const usersCollection = require('../db').db().collection("users"), 
followsCollection = require('../db').db().collection("follows"),
ObjectID = require('mongodb').ObjectId, // get ID from DB
User = require('./User'); // get User


let Follow = function(followedUsername, authorId) {
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []
}

/**
 * Clean Up
 */
Follow.prototype.cleanUp = function() {
    if (typeof(this.followedUsername) != "string") {this.followedUsername = ""}
}

/**
 * Validate
 */
Follow.prototype.validate = async function(action) {
    //followedUsername must exist in DB
    let followedAccount = await usersCollection.findOne({username: this.followedUsername})

    if ( followedAccount ) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("You cannot follow this user")
    }

    let doesFollowAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)})

    if ( action == "create" ) {
        if ( doesFollowAlreadyExist ) { this.errors.push("You are already followed") }
    }

    if ( action == "delete" ) {
        if ( !doesFollowAlreadyExist ) { this.errors.push("You cannot following") }
    }

    //should not be able to follow yourself
    if ( this.followedId.equals(this.authorId)) { this.errors.push("You cannot following yourself") }
}

/**
 * Create Follow
 * @returns Promise
 */
Follow.prototype.create =  function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate("create")

        if (!this.errors.length) {
            await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)}) 
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

/**
 * delete Follow
 * @returns Promise
 */
Follow.prototype.delete =  function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate("delete")

        if (!this.errors.length) {
            await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)}) 
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

/**
 * Create Follow
 * @returns Promise
 */
Follow.isVisitorFollowing = async function(followedId, visitorId) {
    let followedAccount = await followsCollection.findOne({followedId: followedId, authorId: new ObjectID(visitorId)})
    if ( followedAccount ) {
        return true
    } else {
        return false
    }
}

/**
 * getFollowersById
 * @returns Promise
 */
Follow.getFollowersById =  function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let followers = await followsCollection.aggregate([
                {$match: {followedId: id}},
                {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]},
                }}
            ]).toArray()
            followers = followers.map(function(follower) {
                let user = new User(follower, true)
                return {username: follower.username, avatar: user.avatar}
            })
            resolve(followers)
        } catch {
            reject()
        }
    })
}

/**
 * getFollowingById
 * @returns Promise
 */
Follow.getFollowingById =  function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let following = await followsCollection.aggregate([
                {$match: {authorId: id}},
                {$lookup: {from: "users", localField: "followedId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]},
                }}
            ]).toArray()
            following = following.map(function(followed) {
                let user = new User(followed, true)
                return {username: followed.username, avatar: user.avatar}
            })
            resolve(following)
        } catch {
            reject()
        }
    })
}


/**
 * countFollowersById
 * @param {*} id 
 * @returns 
 */
Follow.countFollowersById = function(id) {
    return new Promise(async (resolve, reject) => {
        let followersCount = await followsCollection.countDocuments({followedId: id})
        resolve(followersCount)
    })
}


/**
 * countFollowingById
 * @param {*} id 
 * @returns 
 */
Follow.countFollowingById = function(id) {
    return new Promise(async (resolve, reject) => {
        let FollowingCount = await followsCollection.countDocuments({authorId: id})
        resolve(FollowingCount)
    })
}

module.exports = Follow
