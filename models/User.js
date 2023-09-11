/**
 * User - control, check and send answer to userController.js
 */

const bcrypt = require("bcryptjs"), //about password
usersCollection = require('../db').db().collection("users"), // create db and add new item as users (collection)
validator = require("validator"),
md5 = require("md5"); // for gravatar


let User = function(data, getAvatar) {
  this.data = data
  this.errors = [] // append here about the error
  if (getAvatar == undefined) {
    getAvatar = false
  } else if ( getAvatar ) {
    this.getAvatar()
  }
}

/**
 * Clean Up
 */
User.prototype.cleanUp = function() {
  if (typeof(this.data.username) != "string") {this.data.username = ""}
  if (typeof(this.data.email) != "string") {this.data.email = ""}
  if (typeof(this.data.password) != "string") {this.data.password = ""}

  // get rid of any bogus properties
  this.data = {
    username: this.data.username.trim().toLowerCase(), // trim - removes whitespace from both
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

/**
 * Validate
 * @returns Promise
 * 
 * method await - wait for him then you can publish this
 */
User.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {

    //username
    if (this.data.username == "") {this.errors.push("You must provide a username.")}
    if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Username can only contain letters and numbers.")}
    if (this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Username must be at least 3 characters.")}
    if (this.data.username.length > 30) {this.errors.push("Username cannot exceed 30 characters.")}

    //email
    if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}

    //password
    if (this.data.password == "") {this.errors.push("You must provide a password.")}
    if (this.data.password.length > 0 && this.data.password.length < 3) {this.errors.push("Password must be at least 3 characters.")}
    if (this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 characters.")}
  
    // Only if username is valid then check to see if it's already taken
    if (this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let usernameExists = await usersCollection.findOne({username: this.data.username})
      if (usernameExists) {this.errors.push("That username is already taken.")}
    }
  
    // Only if email is valid then check to see if it's already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({email: this.data.email})
      if (emailExists) {this.errors.push("That email is already being used.")}
    }
    resolve()
  })
}


/**
 * Login
 * @returns Promise
 */
User.prototype.login = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    usersCollection.findOne({username: this.data.username}).then((attemptedUser) => { //get db, find username then add data/info in 'attemptedUser' 
      if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
        this.data = attemptedUser
        this.getAvatar()
        resolve("Congrats!")
      } else {
        reject("Invalid username / password.")
      }
    }).catch(function() {
      reject("Please try again later.")
    })
  })
}


/**
 * Register
 * @returns Promise
 */
User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUp()
    await this.validate()
  
    // Step #2: Only if there are no validation errors 
    // then save the user data into a database
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

/**
 * Get Avatar
 * @returns Promise
 */
User.prototype.getAvatar = function() {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128` // md5 - crypt algorytm from text to ciphers=number/text
}


User.findByUsername = function(username) {
  return new Promise((resolve, reject) => {
    if ( typeof(username) != "string" ) {
      reject()
      return
    }

    usersCollection.findOne({username: username}).then((userDoc) => {
      if (userDoc) {
        userDoc = new User(userDoc, true)
        userDoc = {
          _id: userDoc.data._id,
          username: userDoc.data.username,
          avatar: userDoc.avatar
        }
        resolve(userDoc)
      } else {
        reject()
      }
    }).catch(() => {
      reject()
    })
  })
}


User.doesEmailExist = function(email) {
  return new Promise(async (resolve, reject) => {
    if ( typeof(email) != "string" ) {
      reject(false)
      return
    }

    let user = await usersCollection.findOne({email: email})
    if (user) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

module.exports = User