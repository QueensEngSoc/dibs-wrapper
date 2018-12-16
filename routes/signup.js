// https://scotch.io/tutorials/easy-node-authentication-setup-and-local#toc-database-config-configdatabasejs
var express = require('express');
var router = express.Router();

router.get('/signup', function (req, res, next) { //the request to render the page
    if (req.isAuthenticated())
        return res.redirect('/accounts');

    var msg = req.flash('signupMessage');
    var hasMsg = false;
    if (msg != undefined && msg.length > 0) {
        var msgTxt = msg[0];
        hasMsg = (msgTxt.length > 0) ? true : false;
    }
    res.render('signup', {    // render the page with server side variables passed to the client
        message: msg[0],
        hasMsg: hasMsg
    });

});

export default router;
