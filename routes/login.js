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

        res.render('login', {    // render the page with server side variables passed to the client
            test: "test"
    });

});

module.exports = router;