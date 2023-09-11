// /** 
//  * User - Log in, sign up(register), send error,
//  */

// const usersCollection = require('../db'),
// validator = require("validator"),
// bcrypt = require('bcryptjs');

// let User = function(data) {
//     this.data = data;
//     this.errors = [];
// }

// //CLEAN UP
// User.prototype.cleanUp = function() {
//     if ( typeof( this.data.username != "string" ) ) {
//         this.data.username == "";
//     }

//     if ( typeof( this.data.email != "string" ) ) {
//         this.data.email == "";
//     }

//     if ( typeof( this.data.password != "string" ) ) {
//         this.data.password == "";
//     }

//     //get rid of bogus properties
//     this.data = {
//         username: this.data.username.trim().toLowerCase(), // trim is it remove space
//         email: this.data.email.trim().toLowerCase(),
//         password: this.data.password,
//     }
// }

// //VALIDATION
// User.prototype.validate = function() {
//     return new Promise(async (resolve, reject) => {

//         var this_errors = this.errors;

//         //USERNAME
//         if ( this.data.username == "" ) {
//             this.errors.push("You must provide a username");
//         }
    
//         if ( this.data.username != "" && !validator.isAlphanumeric(this.data.username) ) {
//             this.errors.push("Username can only contain letters and numbers.");
//         }
    
//         if ( this.data.username.length > 0 && this.data.username.length < 3 ) {
//             this.errors.push("username must be at least 3 characters ");
//         }
    
//         if ( this.data.username.length > 31 ) {
//             this.errors.push("username cannot exceed 31 characters ");
//         }
    
//         //Only if username is valid then check to see if its already taken
//         if ( this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username) ) {
//             await usersCollection.getConnection((err, connection) => {
//                 if(err) throw err
                
//                 const data_username = this.data.username;
    
//                 connection.query('SELECT * from users_js WHERE user_username = ?', data_username, (err, rows) => {
//                     connection.release() // return the connection to pool
        
//                     rows.map(function(row) {
//                         if ( (row.user_username && data_username == row.user_username) ) {
//                             this_errors.push("username is exists ");
//                             console.log("is user");
//                         }
//                     })
//                 })
//             })

//         }
    
//         //EMAIL and if email is valid then check to see if its already taken
//         if ( !validator.isEmail(this.data.email) ) {
//             this.errors.push("You must provide a email");
//         } else {
//             usersCollection.getConnection((err, connection) => {
    
//                 if(err) throw err

//                 const data_email = this.data.email;
    
//                 connection.query('SELECT * from users_js WHERE user_email = ?', data_email, (err, rows) => {
//                     connection.release() // return the connection to pool
        
//                     rows.map(function(row) {
//                         if ( (row.user_email && data_email == row.user_email) ) {
//                             this_errors.push("email is exists ");
//                         }
//                     })
//                 })
//             })
//         }
    
    
//         //PASSWORD
//         if ( this.data.password == "" ) {
//             this.errors.push("You must provide a password");
//         }
    
//         if ( this.data.password.length > 0 && this.data.password.length < 2 ) {
//             this.errors.push("Password must be at least 2 characters ");
//         }
    
//         if ( this.data.password.length > 100 ) {
//             this.errors.push("Password cannot exceed 100 characters ");
//         }
//         console.log(this_errors);

//         resolve()
//     })
// }


// User.prototype.login = function() {

//     return new Promise((resolve, reject) => {

//         // this.cleanUp(); // edit1

//         usersCollection.getConnection((err, connection) => {
//             if(err) throw err
    
//             const data_username = this.data.username,
//             data_password = this.data.password;


//             // console.log('connected as id ' + connection.threadId + " " + connection + " " + err);

//             if ( data_username && data_password ) {

//                 connection.query('SELECT * from users_js WHERE user_username = ?', data_username, (err, rows) => {
//                     connection.release() // return the connection to pool
        
//                     if (!err) {

//                         if (rows.length > 0) {
                            
//                             rows.map(function(row) {
//                                 if ( (row.user_password && bcrypt.compareSync(data_password, row.user_password) ) ) {
//                                     resolve('is works in user');
//                                     console.log('works');
//                                 } else {
//                                     console.log('NOT works');

//                                     reject('Invalid username or password');
//                                 }
//                             })
                        
//                         } else {
//                             reject('Invalid username or password');
//                         }
//                     } else {
//                         reject('Invalid username or password');
//                         console.log(err)
//                     }
                    
//                     console.log('The data from beer table are:11 \n', rows)

//                 })

//             } else {
//                 reject('Invalid username or password');
//             }
            
//         }).catch(function() {
//             reject('Try again later');
//         })
//     });
// }


// User.prototype.register = function() {
//     return new Promise( async (resolve, reject) => {
//         // Step #1: Validate user data
//         this.cleanUp();
//         await this.validate();

//         // Step #2: Only if there are no validation errors

//         //push to database

//         if ( !this.errors.length ) {

//             let salt = bcrypt.genSaltSync(10);
//             this.data.password = bcrypt.hashSync(this.data.password, salt);

//             await usersCollection.getConnection((err, connection) => {
//                 if(err) throw err

//                 // console.log('connected as id ' + connection.threadId)
//                 connection.query('INSERT INTO users_js SET user_username = ?, user_email = ?, user_password = ?', [this.data.username, this.data.email, this.data.password], (err, rows) => {
//                     connection.release() // return the connection to pool

//                     if (err) {
//                         console.log(err)
//                     }
                    
//                     console.log('The data from beer table are:11 \n', rows)
//                 })
//             })
//             resolve();
//         } else {
//             reject(this.errors);
//         }
//     })
    

// }

// module.exports = User;