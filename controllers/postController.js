/**
 * PostController - create post
 * 
 */

const Post = require('../models/Post')

/**
 * Display create-post(View Create Screen)
 * @param req 
 * @param res 
 */
exports.viewCreateScreen = function(req, res) {
    // res.render('create-post', {avatar: req.session.user.avatar, username: req.session.user.username}) //old - in file as ejs you put only one word e.g. avatar
    res.render('create-post')
}

/**
 * Create post
 * @param {*} req 
 * @param {*} res 
 */
exports.create = function(req, res) {
    let post = new Post(req.body, req.session.user._id)
    post.create().then(function(newId) {
        req.flash("success", "new post ssuccess")

        req.session.save(function() {
            res.redirect(`/post/${newId}`)
        })
    }).catch(function(errors) {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/create-post"))
    })
}


/**
 * API Create post
 * @param {*} req 
 * @param {*} res 
 */
exports.apiCreate = function(req, res) {
    let post = new Post(req.body, req.apiUser._id)
    post.create().then(function(newId) {
        res.json("congrat")
    }).catch(function(errors) {
        res.json(errors)
    })
}



/**
 * Display single post by id
 * @param {*} req 
 * @param {*} res 
 */
exports.viewSingle = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post, title: post.title})

    } catch {
        res.send('404')
    }
}

/**
 * View Edit Screen is checked by function as findSingleById()
 * @param {*} req 
 * @param {*} res 
 */
exports.viewEditScreen = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id)

        if (post.isVisitorOwner) {  // if admin id is the same edit post id
            res.render('edit-post', {post: post})
        } else {
            req.flash('errors', "You do not have permission to perform that action.") //get error from user->login and transfers to flash in session(db)
            
            //the same 
            // req.session.save(() => {
            //     res.redirect('/')
            // })
            // as below
            req.session.save(() => res.redirect('/'))

        }

    } catch {
        res.send('404')
    }
}

/**
 * Edit is checked by function as update()
 * @param {*} req 
 * @param {*} res 
 */
exports.edit = async function(req, res) {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status) => {
        //the post was successfully updated in the DB
        //or user did have permision, but there were validation errors

        if (status == "success") {
            //post was updated in db
            req.flash("success", "post ssuccess")

            //old
            // req.session.save(function() {
            //     res.redirect(`/post/${req.params.id}/edit`)
            // })
            //the end - old
            
        } else {
            post.errors.forEach(function(error) {
                req.flash("errors", error)
            })

            //old
            // req.session.save(function() {
            //     res.redirect(`/post/${req.params.id}/edit`)
            // })
            //the end - old

        }

        //new
        req.session.save(function() {
            res.redirect(`/post/${req.params.id}/edit`)
        })
        //the end - new
  
    }).catch(() => {
        //a post with the requested id doesn't exist
        //or if the current visitor is not the owner of the requested post

        req.flash('errors', "You do not have permission..") //get error from user->login and transfers to flash in session(db)
        req.session.save(() => {
            res.redirect('/')
        })
    })
}

/**
 * Delete post
 * @param {*} req 
 * @param {*} res 
 */
exports.delete = function(req, res) {
    Post.delete(req.params.id, req.visitorId).then(() => {
        req.flash("success", "post ssuccess deleted")
        req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))

    }).catch(() => {
        req.flash('errors', "You do not have permission.. to delete") //get error from user->login and transfers to flash in session(db)
        req.session.save(() => res.redirect('/'))
    })
}

/**
 * API Delete post
 * @param {*} req 
 * @param {*} res 
 */
exports.apiDelete = function(req, res) {
    Post.delete(req.params.id, req.apiUser._id).then(() => {
        res.json("success")
    }).catch(() => {
        req.json("You do not have permission.. to delete")
    })
}



/**
 * Search post (Is need axios so this will be disabled)
 * @param {*} req 
 * @param {*} res 
 */
exports.search = function(req, res) {
    Post.search(req.body.searchTerm).then((posts) => {
        res.json(posts)
        
        req.flash("success", "post ssuccess deleted")
        req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))

    }).catch(() => {
        res.json([])

        req.flash('errors', "You do not have permission.. to delete") //get error from user->login and transfers to flash in session(db)
        req.session.save(() => res.redirect('/'))
    })
}

