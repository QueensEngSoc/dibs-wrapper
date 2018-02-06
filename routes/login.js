//https://scotch.io/tutorials/easy-node-authentication-setup-and-local

var express = require('express');
var router = express.Router();

router.get('/login', function (req, res, next) {

    if (req.isAuthenticated())
        return res.redirect('/accounts');

    var msg = req.flash('loginMessage');
    var hasMsg = false;
    if (msg != undefined && msg.length > 0) {
        var msgTxt = msg[0];
        hasMsg = (msgTxt.length > 0) ? true : false;
    }
    if (req.query.book != undefined && req.query.book != "")
        req.flash('bookingMessage', req.query.book);

    res.render('login', {    // render the page with server side variables passed to the client
        message: msg[0],
        hasMsg: hasMsg
    });

});

module.exports = router;