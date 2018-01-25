var express = require('express');
var router = express.Router();
var path = require('path');
var roomDB = require('./roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
// const $ = require('najax');
var accountFuncs = require('../models/userFunctions');

// console.log(path.join(__dirname, '/../'));


router.post('/bookroom', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    roomToBook = roomToBook.substr(roomToBook.indexOf('[') + 1);
    var bookingTimeStart = roomToBook.substr(roomToBook.indexOf(',') + 1);
    roomToBook = roomToBook.substr(0, roomToBook.indexOf(','));
    bookingTimeStart = bookingTimeStart.substr(0,bookingTimeStart.indexOf(']'));

    var roomInfo = req.db.get('roomDatabase');
    var roomNum = roomToBook.trim().match(/\d+/)[0] // get the number from the room
    var roomID = parseInt(roomNum, 10);


    roomInfo.find({RoomID: roomID}).each(function(data, val) {
        var temp = data.Free;
        var success = false;
        var header = "Booking failed";
        var bookMsg = "Sorry, an error occured and the room was not booked.  Please try again later."
        if (temp[bookingTimeStart - 7].free == true)
        {
            temp[bookingTimeStart - 7].free = false;

            var usrid = accountFuncs.getUserID(req);
            if (usrid != -1)
                    temp[bookingTimeStart - 7].owner = usrid;

            roomInfo.update({RoomID: roomID}, {$set: {Free : temp}});
            success = true;
            bookMsg = "Booking successful for " + data.Name + " at " + bookingTimeStart + ":30";
            header = "Booking Success!";
        }
        else{
            bookMsg = "Sorry, this room is booked.  Looks like someone beat you to it :(";
            header = "Room Already Booked"
        }

        console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook + " Success" + success);
        res.send({HeaderMsg: header, BookingStatusMsg: bookMsg, BookStatus: success});
    });
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