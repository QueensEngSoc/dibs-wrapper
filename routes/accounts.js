// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var path = require('path');
var roomFuncs = require('./roomDatabase');
var accountFuncs = require('../models/userFunctions');

router.get('/accounts', function (req, res, next) { //the request to render the page
    // var db = req.db;
    // var roomInfo = db.get('roomInfo');
    // roomInfo.find({}, function(e, result) {
    //     res.render('test', {
    //         room: result
    //     });
    // });

    var usrid = accountFuncs.getUserID(req);
    if (usrid == -1 || usrid == undefined)
        res.redirect('/login');
    else {
        roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

            res.render('accountPage', {    // render the page with server side variables passed to the client
                user: req.user,
                booking: listBookings
            });

        });
    }

});

module.exports = router;