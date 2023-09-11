// export default class Search { // is means that you can publish this search anything file. do import Search from './frontend-js/models/search'; and later add new Search()

// const e = require("connect-flash")

// import axios from "axios" //-check on normal wp (where there should works with import) - it is related with search post
// import DOMPurify from "dompurify" //-check on normal wp (where there should works with import) - it is safe before hack

/**
 * SEARCH - file as search
 */  
class Search {
    // 1. Select DOM elements, and keep track of any useful data    
    constructor() {
        this._csrf = document.querySelector('[name="_csrf"]').value
        this.injectHTML()
        this.headerSearchIcon = document.querySelector('.header-search-icon')
        this.overlay = document.querySelector('.search-overlay')
        this.closeIcon = document.querySelector('.close-live-search')
        this.inputField = document.querySelector('#live-search-field')
        this.resultsArea = document.querySelector('.live-search-results')
        this.loaderIcon = document.querySelector('.circle-loader')
        this.typingWaitTimer
        this.previousValue = ""
        this.events()
    }
  
    // 2. Events
    events() {
        this.inputField.addEventListener("keyup", () => {
            this.keyPressHandler()
        })

        this.headerSearchIcon.addEventListener("click", (e) => {
            e.preventDefault()
            this.openOverlay()
        })

        this.closeIcon.addEventListener("click", () => {
            this.closeOverlay()
        })
    }
  
    // 3. Methods
    keyPressHandler() {
        let value = this.inputField.value

        if ( value != "") {
            clearTimeout(this.typingWaitTimer)
            this.hideLoaderIcon()
            this.hideResultArea()
        }
 
        if ( value != "" && value != this.previousValue ) {
            clearTimeout(this.typingWaitTimer)
            this.showLoaderIcon()
            this.hideResultArea()
            this.typingWaitTimer = setTimeout(() => this.sendRequest(), 750)
        }

        this.previousValue = value
    }

    sendRequest() {
        // alert("sendedd")
        /**
         * 1. Import axios..
         * 2. create router a new router.post('/search', postController.search);
         * 3. 
         * 
         * More info: https://www.udemy.com/course/learn-javascript-full-stack-from-scratch/learn/lecture/15225890#questions in 94
         */
        // axios.post('/search', {_csrf: this._csrf, searchTerm: this.inputField.value}).then(response => {
        //     // console.log(response.data); // here you can see result
        //     this.renderResultsHTML(response.data)

        // }).catch(() => {
            
        // })
    }

    /**
     * Result HTML in search
     * 
     * Need active DOMPurify from import
     * @param {*} posts 
     */
    renderResultsHTML(posts) {
        if (posts.length) {
        //     this.resultsArea.innerHTML = DOMPurify.sanitize(`<div class="list-group shadow-sm">
        //     <div class="list-group-item active"><strong>Search Results</strong> (${posts.length > 1 ? `${posts.length} items found` : '1 item found'})</div>
        //     ${posts.map((post) => {
        //         let postDate = new Date(post.createdDate)
        //         return ` <a href="/post/${post._id}" class="list-group-item list-group-item-action">
        //         <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${post.title}</strong>
        //         <span class="text-muted small">by ${post.author.username} on ${postDate.getMonth + 1}/${postDate.getDate}/${postDate.getFullYear}</span>
        //       </a>`
        //     }).join('')}
        //   </div>`)
            
        } else {
            this.resultsArea.innerHTML = 'No result'
        }

        hideLoaderIcon()
        showResultArea()
    }


    showLoaderIcon() {
        this.loaderIcon.classList.add('circle-loader--visible')
    }

    hideLoaderIcon() {
        this.loaderIcon.classList.remove('circle-loader--visible')
    }

    showResultArea() {
        this.resultsArea.classList.add('live-search-results--visible')
    }

    hideResultArea() {
        this.resultsArea.classList.remove('live-search-results--visible')
    }


    openOverlay() {
        // alert("Search js is successfully being executed")
        this.overlay.classList.add('search-overlay--visible')
        setTimeout(() => this.inputField.focus(), 50)
    }

    closeOverlay() {
        this.overlay.classList.remove('search-overlay--visible')
    }

  
    injectHTML() {
        document.body.insertAdjacentHTML('beforeend', `<div class="search-overlay">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
            <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
            <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
    
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results"></div>
          </div>
        </div>
      </div>`)
    }
}
// END SEARCH

/**
 * CHAT Start - file as chat
 * 
 * need socket.io
 */
// export default class Chat {}
class Chat {
    constructor() {
        this.openedYet = false
        this.chatWrapper = document.querySelector('#chat-wrapper')
        this.headerChatIcon = document.querySelector('.header-chat-icon') // openIcon
        this.injectHTML()
        
        this.chatLog = document.querySelector("#chat")
        this.chatField = document.querySelector("#chatField")
        this.chatForm = document.querySelector("#chatForm")
        this.closeIcon = document.querySelector(".chat-title-bar-close")
        this.event()

    }


    //event
    event() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault() //to stop that default behavior
            this.sendMessageToServer()
        })
        this.headerChatIcon.addEventListener('click', () => this.showChat())
        this.closeIcon.addEventListener('click', () => this.hideChat())

    }

    //method

    /**
     * Need works with import as DOMPurify for all text DOMPurify.sanitize(`<div class="chat-self">...`)
     */
    sendMessageToServer() { 
        //emit is sending with name 'chat..'
        this.socket.emit('chatMessageFromBrowser', {message: this.chatField.value}) //'chat...' is sending to app.js to check if whoever is wrote in message
        this.chatLog.insertAdjacentHTML('beforeend', `
        <div class="chat-self">
            <div class="chat-message">
            <div class="chat-message-inner">
                ${this.chatField.value}
            </div>
            </div>
            <img class="chat-avatar avatar-tiny" src="${this.avatar}">
        </div>`)
        this.chatLog.scrollTop = this.chatLog.scrollHeight
        this.chatField.value = ''
        this.chatField.focus()
    }

    showChat() {
        if (!this.openedYet) {
            this.openConnection()
        }
        this.openedYet = true   
        this.chatWrapper.classList.add('chat--visible')
        this.chatField.focus()
    }

    openConnection() {
        this.socket = io()
        this.socket.on('welcome', data => {
            this.username = data.username
            this.avatar = data.avatar
        })

        this.socket.on('chatMessageFromServer', (data) => { //if there is function(data) it's not working..
            this.displayMessageFromServer(data)
        })
    }

    /**
     * Need works with import as DOMPurify for all text DOMPurify.sanitize(`<div class="chat-other"...`)
     * @param {*} data 
     */
    displayMessageFromServer(data) {
        this.chatLog.insertAdjacentHTML('beforeend', `<div class="chat-other">
        <a href="/profile/${data.username}"><img class="avatar-tiny" src="${data.avatar}"></a>
        <div class="chat-message"><div class="chat-message-inner">
          <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
          ${data.message}
        </div></div>
      </div>`)
      this.chatLog.scrollTop = this.chatLog.scrollHeight
    }

    hideChat() {
        this.chatWrapper.classList.remove('chat--visible')
    }

    injectHTML() {
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id="chat" class="chat-log"></div>

        <form id="chatForm" class="chat-form border-top">
            <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
        `
    }
}

// END CHAT


// import axios from "axios" //-check on normal wp (where there should works with import) - it is related with search post
/**
 * RegistrationForm Start file as registrationForm
 * 
 * need 
 */
// export default class RegistrationForm {}
class RegistrationForm {
    constructor() {
        this._csrf = document.querySelector('[name="_csrf"]').value
        this.form = document.querySelector('#registration-form')
        this.allFields = document.querySelectorAll('#registration-form .form-control')
        this.insertValidationElements()
        this.username = document.querySelector('#username-register')
        this.username.previousValue = ''
        this.email = document.querySelector('#email-register')
        this.email.previousValue = ''
        this.password = document.querySelector('#password-register')
        this.password.previousValue = ''
        this.username.isUnique = false
        this.email.isUnique = false

        this.event()

    }


    //event
    event() {
        this.form.addEventListener('submit', () => {
            formSubmitHandler()
        })

        //keyup
        this.username.addEventListener('keyup', () => {
            this.isDifferent(this.username, this.usernameHandler)
        })

        this.email.addEventListener('keyup', () => {
            this.isDifferent(this.email, this.emailHandler)
        })

        this.password.addEventListener('keyup', () => {
            this.isDifferent(this.password, this.passwordHandler)
        })

        //blur
        this.username.addEventListener('blur', () => {
            this.isDifferent(this.username, this.usernameHandler)
        })

        this.email.addEventListener('blur', () => {
            this.isDifferent(this.email, this.emailHandler)
        })

        this.password.addEventListener('blur', () => {
            this.isDifferent(this.password, this.passwordHandler)
        })
    }

    //method
    formSubmitHandler() {
        this.usernameImmediately()
        this.usernameAfterDelay()
        this.emailAfterDelay()
        this.passwordImmediately()
        this.passwordAfterDelay()

        if (
            this.username.isUnique &&
            !this.username.errors &&
            this.email.isUnique &&
            !this.email.errors &&
            !this.password.errors
        ) {
            this.form.submit()
        }

    }

    isDifferent(el, handler) {
        if (el.previousValue != el.value) {
            handler.call(this) // call - is method that is available to functions. Is direction to this.usernameHandler
        }
        el.previousValue = el.value
    }

    usernameHandler() {
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(() => this.usernameAfterDelay(), 750)
    }

    emailHandler() {
        this.email.errors = false
        clearTimeout(this.email.timer)
        this.email.timer = setTimeout(() => this.emailAfterDelay(), 750)
    }

    passwordHandler() {
        this.password.errors = false
        this.passwordImmediately()
        clearTimeout(this.password.timer)
        this.password.timer = setTimeout(() => this.passwordAfterDelay(), 750)
    }

    usernameImmediately() {
        if ( this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value) ) { //this symbol is checking if you have another than letter and alfabet
            this.showValidationError(this.username, "username can olny letter and number")
        }

        if ( this.username.value.length > 30 ) {
            this.showValidationError(this.username, "username cannot more than 30 letters")
        }

        if ( !this.username.errors ) {
            this.hideValidationError(this.username)
        }
    }

    passwordImmediately() {
        if ( this.password.value.length > 30 ) {
            this.showValidationError(this.password, "password cannot more than 30 letters")
        }

        if ( !this.password.errors ) {
            this.hideValidationError(this.password)
        }
    }

    /**
     * showValidationError - SHOW
     * @param {*} el 
     * @param {*} message 
     */
    showValidationError(el, message) {
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.username.errors = true
    }

    /**
     * hideValidationError - HIDE
     * @param {*} el 
     */
    hideValidationError(el) {
        // el.nextElementSibling.innerHTML = ''
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
        // el.username.errors = false
    }

    usernameAfterDelay() {
        if ( this.username.value.length < 3 ) {
            this.showValidationError(this.username, "username cannot less than 3 letters")
        }

        //need active import from axios
        // if (!this.username.errors) {
            //// axios.post( the url where we want provide (later add to in router.js), {_csrf (safe), username: the field - this.username.value})
        //     axios.post('/doesUsernameExist', {_csrf: this._csrf, username: this.username.value}).then((response) => {
        //         if (response.data) {
        //             this.showValidationError(this.username, "That username is aldready taken")
        //             this.username.isUnique = false
        //         } else {
        //             this.username.isUnique = true
        //             this.hideValidationError(this.username)
        //         }
        //     }).catch(() => {
                
        //     })
        // }
    }

    emailAfterDelay() {
        if ( !/^\S+@\S+$/.test(this.email.value) ) {
            this.showValidationError(this.email, "you must provide a valid email")
        }

        //need active import from axios
        // if (!this.email.errors) {
        //     axios.post('/doesEmailExist', {_csrf: this._csrf, email: this.email.value}).then((response) => {
        //         if (response.data) {
        //             this.showValidationError(this.email, "That email is aldready taken")
        //             this.email.isUnique = false
        //         } else {
        //             this.email.isUnique = true
        //             this.hideValidationError(this.email)
        //         }
        //     }).catch(() => {
                
        //     })
        // }
    }

    passwordAfterDelay() {
        if ( this.password.value.length < 12 ) {
            this.showValidationError(this.password, "password cannot less than 12 letters")
        }
    }

    insertValidationElements() {
        this.allFields.forEach(function(el) {
            el.insertAdjacentHTML('afterend', `<div class="alert alert-danger small liveValidateMessage"></div>`)
        })
    }
    
}

// END RegistrationForm


if ( document.querySelector('#registration-form') ) {
    new RegistrationForm()
}

if ( document.querySelector('.header-search-icon') ) {
    new Search()
}

if ( document.querySelector('#chat-wrapper') ) {
    new Chat()
}