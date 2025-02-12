const Follow = require('../models/Follow');

/**
 * Add Follow
 * @param {*} req 
 * @param {*} res 
 */
exports.addFollow = function(req, res) {
    let follow = new Follow(req.params.username, req.visitorId)
    follow.create().then(() => {
        req.flash("success", `ssuccess follow ${req.params.username}`)

        req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch((errors) => {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/"))
    })
}


/**
 * Remove Follow
 * @param {*} req 
 * @param {*} res 
 */
exports.removeFollow = function(req, res) {
    let follow = new Follow(req.params.username, req.visitorId)
    follow.delete().then(() => {
        req.flash("success", `ssuccess stop follow ${req.params.username}`)

        req.session.save(() => res.redirect(`/profile/${req.params.username}`))
    }).catch((errors) => {
        errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/"))
    })
}