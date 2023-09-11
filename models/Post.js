/**
 * Post - Single post
 */

const postsCollection = require('../db').db().collection("posts"), // create db and add new item as users (collection)
followsCollection = require('../db').db().collection("follows"),
ObjectID = require('mongodb').ObjectId, // get ID from DB
User = require('./User'), // get User
sanitizeHTML = require("sanitize-html"); // safe before hack via text. this remove script, code


let Post = function(data, userid, requestedPostId) {
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId = requestedPostId  // you can fint it in postController.js as edit
}

/**
 * Clean Up
 */
Post.prototype.cleanUp = function() {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // get rid of any bogus properties
    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {} }), // trim - removes whitespace from both
        body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {} }),
        createdDate: new Date(),
        author: new ObjectID(this.userid)
    }
}

/**
 * Validate
 */
Post.prototype.validate = function() {
    if (this.data.title == "") {this.errors.push("You must provide a title.")} // if empty
    if (this.data.body == "") {this.errors.push("You must provide a body.")} // if empty
}

/**
 * Create post
 * @returns Promise
 */
Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()

        if (!this.errors.length) {
            postsCollection.insertOne(this.data).then((info) => { // insert a new of data post to DB
                resolve(info.insertedId)
            }).catch(() => {
                this.errors.push("please try again later")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        }
    })
}

/**
 * Update post
 * @returns Promise
 */
Post.prototype.update = function() {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId, this.userid)  // find( request post id , user id)

            if ( post.isVisitorOwner) { // isVisitorOwner - if is admin this post?
                //actually update the db
                let status = await this.actuallyUpdate() // check if is error and update
                resolve(status)
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

/**
 * Actually Update post
 * @returns Promise
 */
Post.prototype.actuallyUpdate = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()

        if (!this.errors.length) {
            await postsCollection.findOneAndUpdate(
                {
                    _id: new ObjectID(this.requestedPostId)
                },
                {
                    $set: 
                    {
                        title: this.data.title,
                        body: this.data.body
                    }
                }
            )
            resolve("success")
        } else {
            resolve("failuer")
        }
    })
}


/**
 * Reusable Post Query
 * @param uniqueOperations
 * @returns Promise
 */
Post.reusablePostQuery = function(uniqueOperations, visitorId, finalOperations = []) {
    return new Promise(async (resolve, reject) => {
        let aggOperations = uniqueOperations.concat([ // concat - is going to return a new array and whatever we give it in these parantheses, it is going to add
            {
                $lookup: { // lookup - look up to another collection and find
                    from: "users", // find name of collection
                    localField: "author", //pick with one from posts you want set it
                    foreignField: "_id", // ..
                    as: "authorDocument" // create a new property as authorDocument 
                }
            },
            {
                $project: { // display
                    title: 1,
                    body: 1,
                    createdDate: 1,
                    authorId: "$author",
                    author: {$arrayElemAt: ["$authorDocument", 0]} // set author to array from lookup via authorDocument
                }
            }
        ]). concat(finalOperations)

        // let post = await postsCollection.findOne({_id: new ObjectID(id)}) // old
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        //clean up author property in each post object
        posts = posts.map( function(post) { //map - lets us return a brand new array
            post.isVisitorOwner = post.authorId.equals(visitorId) // equals - is going to return either a value of true or false
            post.authorId = undefined // for moment

            post.author = { // set these types from user
                username: post.author.username,
                avatar: new User(post.author, true).avatar // true is means to get getAvatar from contruction as User.js 
            }
            return post
        })

        resolve(posts)
    })
}


/**
 * Display single post (find single by id)
 * @param id Index from users to posts
 * @returns Promise
 */
Post.findSingleById = function(id, visitorId) {
    return new Promise(async (resolve, reject) => {
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }

        //OLD
        //// let post = await postsCollection.findOne({_id: new ObjectID(id)}) // the first old
        // let posts = await postsCollection.aggregate([ //aggregate - perform complex or multiple operations
        //     {
        //         $match: { // select this ID from DB - sign match will tell mangodb that what we want to do
        //             _id: new ObjectID(id)
        //         }
        //     },
        //     {
        //         $lookup: { // lookup - look up to another collection and find
        //             from: "users", // find name of collection
        //             localField: "author", //pick with one from posts you want set it
        //             foreignField: "_id", // ..
        //             as: "authorDocument" // create a new property as authorDocument 
        //         }
        //     },
        //     {
        //         $project: { // display
        //             title: 1,
        //             body: 1,
        //             createdDate: 1,
        //             author: {$arrayElemAt: ["$authorDocument", 0]} // set author to array from lookup via authorDocument
        //         }
        //     }
        // ]).toArray()

        // //clean up author property in each post object
        // posts = posts.map( function(post) { //map - lets us return a brand new array
        //     post.author = { // set these types from user
        //         username: post.author.username,
        //         avatar: new User(post.author, true).avatar // true is means to get getAvatar from contruction as User.js 
        //     }
        //     return post
        // })
        //The end of OLD

        let posts = await Post.reusablePostQuery([
            {
                $match: { // select this ID from DB - sign match will tell mangodb that what we want to do
                    _id: new ObjectID(id)
                }
            }
        ], visitorId)

        if (posts.length) {
            // console.log(posts[0]); // you can see result
            resolve(posts[0]) // display the first result
        } else {
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId) {
    return Post.reusablePostQuery([
        {
            $match: { // select this ID from DB - sign match will tell mangodb that what we want to do
                author: authorId
            }
        },
        {
            $sort: {
                createdDate: -1
            }
        }
    ])

}


/**
 * Delete post
 * @returns Promise
 */
Post.delete = function(postIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postIdToDelete, currentUserId)  // find( request post id , user id)

            if ( post.isVisitorOwner ) { // isVisitorOwner - if is admin this post?

                await postsCollection.deleteOne(
                    {
                        _id: new ObjectID(postIdToDelete)
                    }
                )
                resolve()
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}


/**
 * search post - is need axios
 * 
 * More info: https://www.udemy.com/course/learn-javascript-full-stack-from-scratch/learn/lecture/15225890#questions in 94
 * @returns Promise
 */
Post.search = function(searchTerm) {
    return new Promise(async (resolve, reject) => {
        if ( typeof(searchTerm) == "string" ) {
            let posts = await Post.reusablePostQuery([
                {
                    $match: {
                        $text: {
                            $search: searchTerm
                        }
                    }
                }
            ], undefined,[
            {
                $sort: {
                    score: {
                        $meta: "textScore"
                    }
                }
            }]) 

            resolve(posts)

        } else {
            reject()
        }
    })
}

/**
 * countPostsByAuthor
 * @param {*} id 
 * @returns 
 */
Post.countPostsByAuthor = function(id) {
    return new Promise(async (resolve, reject) => {
        let postCount = await postsCollection.countDocuments({author: id})
        resolve(postCount)
    })
}


/**
 * getFeed 
 * @param {*} id 
 * @returns 
 */
Post.getFeed = async function(id) {
    //create an array of the user ids that the current user follows
    let followedUsers = await followsCollection.find({authorId: new ObjectID(id)}).toArray()
    followedUsers = followedUsers.map(function(followDoc) {
        return followDoc.followedId
    })
    //look for posts where the author is in the above array of followed users
    return Post.reusablePostQuery([
        {$match: {author: {$in: followedUsers}}},
        {$sort: {createdDate: -1}}
    ])
}



module.exports = Post