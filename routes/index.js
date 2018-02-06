var express = require('express');
var router = express.Router();
var path = require('path');
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
// const $ = require('najax');
var accountFuncs = require('../models/userFunctions');
var roomBook = require('../models/roomBooking');

// console.log(path.join(__dirname, '/../'));


router.post('/bookroom', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    roomToBook = roomToBook.substr(roomToBook.indexOf('[') + 1);
    var bookingTimeStart = roomToBook.substr(roomToBook.indexOf(',') + 1);
    roomToBook = roomToBook.substr(0, roomToBook.indexOf(','));
    var roomName = bookingTimeStart.substring(0, bookingTimeStart.indexOf(']'));

    bookingTimeStart = bookingTimeStart.substr(0, bookingTimeStart.indexOf(','));
    roomName = roomName.substr(roomName.indexOf('"') + 1);
    roomName = "BMH-" + roomName.trim().match(/\d+/)[0] // get the number from the room

    var roomNum = roomToBook.trim().match(/\d+/)[0] // get the number from the room
    var roomID = parseInt(roomNum, 10);
    var usrid = accountFuncs.getUserID(req);
    var day = 0;
    var length = 1;

    if (usrid == -1 || usrid == undefined) {
        // // res.redirect('/login');
        res.send({
            HeaderMsg: "You must login",
            BookingStatusMsg: roomID + "-" + bookingTimeStart + "-" + length + "-" + day,
            BookStatus: false
        });
        // req.session.
        // req.session.redirectTo = '/login';
        // res.redirect('/login');
    }
    else {
        roomBook.bookRoom(day, bookingTimeStart, roomID, length, usrid, req).then(function (data) {
            console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook + " Success: " + data.success);
            res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
        });
    }
});

router.get('/', function (req, res, next) { //the request to render the page

    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();

    if (current_min < 30)
        current_hour --;

    var usrid = accountFuncs.getUserID(req);

    roomDB.getListOfRoomState(dateObj.getDate(), current_hour, usrid).then(function (listFree) {
        res.render('index', {
            list: listFree,
            navLink: '<a href="/map" style="color: #fff;">MAP</a>',
            navPic: '<a href="/map" style="padding-top: 5px;"><img src="/img/mapfix.png" height="30" width="30"></a>'
        });
    });
});

router.get('/book/:roomName/', function (req, res, next) {
    var room = req.params.roomName;
    room = room.toUpperCase();
    room = room.replace(/-/g, ' '); // strip out dashes

    roomDB.getInfoByName(room).then(function (out) {
        var roomID = out.roomid;
        roomDB.getFree(0, roomID).then(function (out1) { //so this is the dumbest thing ever XD, we'll talk
            var usrid = accountFuncs.getUserID(req);
            out.userid = usrid;
            out.free = out1;
            out.navLink = '<a href="/" style="color: #fff;">GRID</a>';
            out.navPic = '<a href="/" style="padding-top: 5px;"><img src="/img/grid.png" height="30" width="30"></a>';

            res.render('roomInfo', out);
        });
    });
});

module.exports = router;