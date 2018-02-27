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
            out.theme = req.theme === "custom" ? false : req.theme;
            out.colors = req.colors;
            res.render('roomInfo', out);
        });
    }).catch(function () {
        res.render("404", {
            message: "<p>That room does not exist!</p>" +
            "<p><a href='/'>Go back to the homepage</a> or <a href='/quicky'>QuickBook a room</a>!</p>",
            image: "trail.jpg",
            theme: req.theme === "custom" ? false : req.theme,
            colors: req.colors
        });
    });
});

router.get('/book/:roomName/:date', function (req, res, next) {
    var room = req.params.roomName;
    var datestr = req.params.date;
    var parts = datestr.split('-');
    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    var date = new Date(parts[0], parts[1]-1, parts[2]); // Note: months are 0-based
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
            if (out1 == undefined) {
                var max = new Date(today.getDate() + 14);
                var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

                res.render("404", {
                    message: "<p>You cannot book that far ahead!  The limit is " + max.toLocaleDateString('en-CA', options) + "</p>" + "<p>Pick a different time, " +
                    "<a href='/'>Go back to the homepage</a> or <a href='/quicky'>QuickBook a room</a>!</p>",
                    image: "trail.jpg",
                    theme: req.theme === "custom" ? false : req.theme,
                    colors: req.colors
                });
            }
            else {
                var usrid = accountFuncs.getUserID(req);
                var imgID = room.replace(/\s+/g, '') + '.jpg';
                out.userid = usrid;
                out.free = out1;
                out.imgURL = '../../img/' + imgID;
                out.day = diff;
                out.theme = req.theme === "custom" ? false : req.theme;
                out.colors = req.colors;
                res.render('roomInfo', out);
            }
        });
    }).catch(function () {
        res.render("404", {
            message: "<p>That room does not exist!</p>" +
            "<p><a href='/'>Go back to the homepage</a> or <a href='/quicky'>QuickBook a room</a>!</p>",
            image: "trail.jpg",
            theme: req.theme === "custom" ? false : req.theme,
            colors: req.colors
        });
    });
});

module.exports = router;