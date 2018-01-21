//https://scotch.io/tutorials/easy-node-authentication-setup-and-local

var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/login', function (req, res, next) { //the request to render the page
    // var db = req.db;
    // var roomInfo = db.get('roomInfo');
    // roomInfo.find({}, function(e, result) {
    //     res.render('test', {
    //         room: result
    //     });
    // });
    if (req.isAuthenticated())
        res.redirect('/accounts');

    var msg = req.flash('loginMessage');
    var hasMsg = false;
    if (msg != undefined && msg.length > 0) {
        var msgTxt = msg[0];
        hasMsg = (msgTxt.length > 0) ? true : false;
    }
    res.render('login', {    // render the page with server side variables passed to the client
        message: msg[0],
        hasMsg: hasMsg
    });

});

module.exports = router;