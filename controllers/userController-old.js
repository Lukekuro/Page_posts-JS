// /** 
//  * User Controller - redirection to router.js
//  * Work with models/User as User
//  */

// const User = require('../models/User');

// //Page Login
// exports.login = function(req, res) {
//     let user = new User(req.body);
//     console.log(req.body);

//     /**
//      * user.login(function(result) {
//      * when you have result in function it is means that  you can get answers from User.js -> login as -> User.prototype.login = function(callback) {}
//      * Where need add text or info in callback e.g. callback("wrong");
//      */

//     //OLD
//     // user.login().then(function(result) {
//     //     req.session.user = {fav: "blue", username: user.data.username}
//     //     // res.send(result);

//     // }).catch(function(e) {
//     //     res.send(e);
//     // })
//     //THE END OLD

//     user.login().then(function(result) {
//         console.log('is login');

//         req.session.user = {username: user.data.username}
//         // res.render('home-dashboard', {username: req.session.user.username});
//         // req.session.save( function() {
//         //     res.redirect('/');
//         // })
//         console.log('user.data.username ', user.data.username);
//         res.send(result);
        
//     }).catch(function(e) {
//         console.log('is error login');
        
//         req.flash('errors', e);
//         req.session.save(function() {
//             res.redirect('/');
//         })
//     })
// }

// exports.logout = function(req, res) {
//     req.session.destroy();
//     res.redirect('/');
// }

// //Page register
// exports.register = function(req, res) {
//     let user = new User(req.body);
    
//     user.register().then(() => {
//         req.session.user = {username: user.data.username}
//         req.session.save(function() { // if there we have two the same then move to down 2 -> 1
//             res.redirect('/'); 
//         })
//     }).catch((reqError) => {
//         reqError.forEach(function(error) {
//             req.flash('reqErrors', error);
//         })
//         req.session.save(function() {
//             res.redirect('/');
//         })
//     })

   

//     // user.register();
//     // if ( user.errors.length ) {
       
//     // } else {
//     //     res.send('good');
//     // }

//     // res.render('home-guest');
// }

// //Homepage
// exports.home = function(req, res) {
//     if ( req.session.user ) {
//         res.render('home-dashboard', {username: req.session.user.username});

//     } else {
//         res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')}); // get all code from home-guest.ejs
//     }
// }