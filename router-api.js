/**
 * This is API. Is connected with Postman
 * 
 * Postman -> headers -> key: content-type, value: application/json
 */

const apiRouter = require('express').Router(),
userController = require('./controllers/userController'),
postController = require('./controllers/postController'),
followController = require('./controllers/followController');

// const cors = require('cors') // enable all api to display e.g. in codepen (e.g. display post by url from postman)
// apiRouter.use(cors())

/**
 * LOGIN
 * Direction: API POST
 * Postman -> body -> raw -> username: luke, password: luke
 */
apiRouter.post('/login', userController.apiLogin)

/**
 * CREATE POST
 * Direction: API POST
 * Postman -> body -> raw -> title: ttitle, body: content, token: (copy text of token from jwt.sign in (userController.js))
 */
apiRouter.post('/create-post', userController.apiMustBeLoggedIn, postController.apiCreate)

/**
 * DELETE POST
 * Direction: API DELETE
 *
 * Postman -> body -> raw -> token: (copy text of token from jwt.sign in (userController.js))
 * e.g url: http://localhost:3000/api/post/64f859fed0ddd2d65b5dde1a
 */
apiRouter.delete('/post/:id', userController.apiMustBeLoggedIn, postController.apiDelete)

/**
 * postsByAuthor - display posts by username(in inside by id)
 * Direction: API GET
 * Postman -> body -> raw -> empty/nothing, 
 * Postman -> body -> none
 * e.g. url: http://localhost:3000/api/postsByAuthor/luke
 */
apiRouter.get('/postsByAuthor/:username', userController.apiGetPostsByUsername)

module.exports = apiRouter