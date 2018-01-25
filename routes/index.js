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
    bookingTimeStart = bookingTimeStart.substr(0,bookingTimeStart.indexOf(']'));

    var roomNum = roomToBook.trim().match(/\d+/)[0] // get the number from the room
    var roomID = parseInt(roomNum, 10);
    var usrid = accountFuncs.getUserID(req);

    if (usrid != -1) {
        roomBook.bookRoom(0, bookingTimeStart, roomID, usrid).then(function (data) {
            console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook + " Success" + data.success);
            res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
        });
    }
});


router.get('/', function (req, res, next) { //the request to render the page

    var roomID = 1;
    roomDB.getInfo(roomID).then(function(out) {
        roomDB.getFree(0, roomID).then(function(out1){ //so this is the dumbest thing ever XD, we'll talk
            out.free = out1;
            res.render('roomInfo', out);
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

            res.render('roomInfo', out);
        });
    });
});

module.exports = router;