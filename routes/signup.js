// https://scotch.io/tutorials/easy-node-authentication-setup-and-local#toc-database-config-configdatabasejs

var express = require('express');
var router = express.Router();
var path = require('path');
var passport = require('passport');


router.get('/signup', function (req, res, next) { //the request to render the page
    // var db = req.db;
    // var roomInfo = db.get('roomInfo');
    // roomInfo.find({}, function(e, result) {
    //     res.render('test', {
    //         room: result
    //     });
    // });

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

module.exports = router;