var express = require('express');
var router = express.Router();
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
var accountFuncs = require('../models/userFunctions');

router.get('/book/:roomName/', function (req, res, next) {
    var room = req.params.roomName;
    room = room.toUpperCase();
    room = room.replace(/-/g, ' '); // strip out dashes

    roomDB.getInfoByName(room).then(function (out) {
        var roomID = out.roomid;

        roomDB.getFree(0, roomID).then(function (out1) { //so this is the dumbest thing ever XD, we'll talk
            var usrid = accountFuncs.getUserID(req);
            var imgID = room.replace(/\s+/g, '') + '.jpg';
            out.userid = usrid;
            out.free = out1;
            out.imgURL = '../img/' + imgID;
            out.day = 0;
            res.render('roomInfo', out);
        });
    }).catch(function () {
        res.render("404", {
            message: "<p>That room does not exist!</p>" +
            "<p><a href='/'>Go back to the homepage</a> or <a href='/quick'>QuickBook a room</a>!</p>",
            image: "trail.jpg"
        });
    });
});

router.get('/book/:roomName/:date', function (req, res, next) {
    var room = req.params.roomName;
    var datestr = req.params.date;
    var date = new Date(datestr);
    var today = new Date();
    var diff = date - today;
    diff = Math.ceil(diff / (1000 * 3600 * 24));
    //one_day means 1000*60*60*24
    //one_hour means 1000*60*60
    //one_minute means 1000*60
    //one_second means 1000

    room = room.toUpperCase();
    room = room.replace(/-/g, ' '); // strip out dashes

    roomDB.getInfoByName(room).then(function (out) {
        var roomID = out.roomid;

        roomDB.getFree(diff, roomID).then(function (out1) { //so this is the dumbest thing ever XD, we'll talk
            var usrid = accountFuncs.getUserID(req);
            var imgID = room.replace(/\s+/g, '') + '.jpg';
            out.userid = usrid;
            out.free = out1;
            out.imgURL = '../../img/' + imgID;
            out.day = diff;
            res.render('roomInfo', out);
        });
    }).catch(function () {
        res.render("404", {
            message: "<p>That room does not exist!</p>" +
            "<p><a href='/'>Go back to the homepage</a> or <a href='/quick'>QuickBook a room</a>!</p>",
            image: "trail.jpg"
        });
    });
});


module.exports = router;