/**
 * userController - login, regiter, logout and send it to app.js (with one should be display on page)
 */

const User = require('../models/User'),
Post = require('../models/Post'),
Follow = require('../models/Follow'),
jwt = require('jsonwebtoken'),
dotenv = require('dotenv');
dotenv.config()

/**
 * apiGetPostsByUsername 
 * @param {*} req 
 * @param {*} res 
 */
exports.apiGetPostsByUsername = async function(req, res) {
  try {
    let authorDoc = await User.findByUsername(req.params.username) // params as username - get from url by (:username)
    let posts = await Post.findByAuthorId(authorDoc._id)
    res.json(posts)
  } catch {
    res.json('sorry, invalid user requested')
    
  }
}

/**
 * doesUsernameExist -- need active import from axios in main.js
 * @param {*} req 
 * @param {*} res 
 */
exports.doesUsernameExist = function(req, res) {
  User.findByUsername(req.body.username).then(() => {
    res.json(true)
  }).catch(() => {
    res.json(false)
  })
}

/**
 * doesEmailExist -- need active import from axios in main.js
 * @param {*} req 
 * @param {*} res 
 */
exports.doesEmailExist = async function(req, res) {
  let emailBool = await User.doesEmailExist(req.body.email)
    res.json(emailBool)
}


/**
 * Share Profil Data (is following)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.sharedProfileData = async function(req, res, next) {
  let isVisitorsProfile = false
  let isFollowing = false
  if (req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
    isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
  }

  req.isVisitorsProfile = isVisitorsProfile
  req.isFollowing = isFollowing

  //retrieve post, followers, following counts
  let postCountPromise = Post.countPostsByAuthor(req.profileUser._id), // tutaj było await, został przeniesiony do promise.all i z tego stworzyło array
  followersCountPromise = Follow.countFollowersById(req.profileUser._id),
  followingCountPromise = Follow.countFollowingById(req.profileUser._id),
  [postCount, followersCount, followingCount] = await Promise.all([postCountPromise, followersCountPromise, followingCountPromise]);

  req.postCount = postCount
  req.followersCount = followersCount
  req.followingCount = followingCount

  next()
}

/**
 * Must be Logged In
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.mustBeLoggedIn = function(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    // req.flash("errors", "You must be logged");
    req.session.save(function() {
      res.redirect('/')
    })
  }
}


/**
 * API Must be Logged In
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.apiMustBeLoggedIn = function(req, res, next) {
  try {
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET )
    next()
  } catch {
    res.json("sorry, wrong loggen")
  }
}


/**
 * Login
 * @param {*} req 
 * @param {*} res 
 */
exports.login = function(req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id } // save username to session (db)
    req.session.save(function() {
      res.redirect('/')
    })

  }).catch(function(e) {
    req.flash('errors', e) //get error from user->login and transfers to flash in session(db)
    req.session.save(function() {
      res.redirect('/')
    })

  })
}



/**
 * apiLogin
 * @param {*} req 
 * @param {*} res 
 */
exports.apiLogin = function(req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
  //  res.json("good " + process.env.JWTSECRET + "")
   res.json(jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: '7d'}))

  }).catch(function(e) {
    res.json("bad")
  })
}

/**
 * Logout
 * @param {*} req 
 * @param {*} res 
 */
exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/')
  })
}

/**
 * Register
 * @param {*} req 
 * @param {*} res 
 */
exports.register = function(req, res) {
  let user = new User(req.body)
  user.register().then(() => {
    req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id}
    req.session.save(function() {
      res.redirect('/')
    })
  }).catch((regErrors) => {
    regErrors.forEach(function(error) {
      req.flash('regErrors', error) //get error from user->register and transfers to flash in session(db)
    })
    req.session.save(function() {
      res.redirect('/')
    })
  })
}

/**
 * Home
 * @param {*} req 
 * @param {*} res 
 */
exports.home = async function(req, res) {
  if (req.session.user) {
    // res.render('home-dashboard', {avatar: req.session.user.avatar, username: req.session.user.username})  //old - in file as ejs you put only one word e.g. avatar
    // res.render('home-dashboard')

    //fetch feed of posts for current user
    let posts = await Post.getFeed(req.session.user._id) //show posts from another user where i followed (followers)
    res.render('home-dashboard', {posts: posts})
  } else {
    res.render('home-guest', {regErrors: req.flash('regErrors')}) // old -- errors: req.flash('errors'), -- old ->  get info from flash as error (in session (db))
  }
}


/**
 * ifUserExists
 * @param {*} req 
 * @param {*} res 
 */
exports.ifUserExists = function(req, res, next) {
  User.findByUsername(req.params.username).then((userDocument) => {
    req.profileUser = userDocument
    next() // next to function router->( userController.ifUserExists - if here is append next() then will passes to -> userController.profilePostsScreen )
  }).catch(() => {
    res.render('404')
  })
}

/**
 * profilePostsScreen
 * @param {*} req 
 * @param {*} res 
 */
exports.profilePostsScreen = function(req, res) {
  //ask our post model for posts by a certain author id
  Post.findByAuthorId(req.profileUser._id).then((posts) => {
    res.render('profile', {
        title: `Profile for ${req.profileUser.username}`,
        currentPage: "posts",
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorsProfile: req.isVisitorsProfile,
        counts: {postCount: req.postCount, followersCount: req.followersCount, followingCount: req.followingCount}
    })
  }).catch(() => {
    res.render('404')
  })
}

/**
 * profileFollowersScreen 
 * @param {*} req 
 * @param {*} res 
 */
exports.profileFollowersScreen = async function(req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id)
      res.render('profile-followers', {
          title: `Followers for ${req.profileUser.username}`,
          currentPage: "followers",
          followers: followers,
          profileUsername: req.profileUser.username,
          profileAvatar: req.profileUser.avatar,
          isFollowing: req.isFollowing,
          isVisitorsProfile: req.isVisitorsProfile,
          counts: {postCount: req.postCount, followersCount: req.followersCount, followingCount: req.followingCount}
      })
  } catch {
    res.render('404')
  }
}


/**
 * profileFollowingScreen 
 * @param {*} req 
 * @param {*} res 
 */
exports.profileFollowingScreen = async function(req, res) {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id)
      res.render('profile-following', {
          title: `Following for ${req.profileUser.username}`,
          currentPage: "following",
          following: following,
          profileUsername: req.profileUser.username,
          profileAvatar: req.profileUser.avatar,
          isFollowing: req.isFollowing,
          isVisitorsProfile: req.isVisitorsProfile,
          counts: {postCount: req.postCount, followersCount: req.followersCount, followingCount: req.followingCount}
      })
  } catch {
    res.render('404')
  }
}




