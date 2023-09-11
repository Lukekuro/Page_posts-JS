/**
 * Router - Display website via end name of url
 */

const express = require("express"),
router = express.Router(),
userController = require('./controllers/userController'),
postController = require('./controllers/postController'),
followController = require('./controllers/followController');

//user related routes
router.get('/', userController.home); // homepage
router.post('/register', userController.register); // page register
router.post('/login', userController.login); // page login
router.post('/logout', userController.logout); // page logout
router.post('/doesUsernameExist', userController.doesUsernameExist); // need active import from axios in main.js
router.post('/doesEmailExist', userController.doesEmailExist); // need active import from axios in main.js


//user related routes
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen); // page create-post
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen); // page create-post
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen); // page create-post

//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen); // page create-post
router.post('/create-post', userController.mustBeLoggedIn, postController.create); // page create-post
router.get('/post/:id', postController.viewSingle);
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen);
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.edit);
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.delete);
router.post('/search', postController.search); // need axios

//follow related routes
router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow); 
router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow); 


module.exports = router;