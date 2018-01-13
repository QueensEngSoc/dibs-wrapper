var express = require('express');
var router = express.Router();
var path = require('path');
// const $ = require('najax');

// console.log(path.join(__dirname, '/../'));


router.post('/bookroom', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    roomToBook = roomToBook.substr(roomToBook.indexOf('[') + 1);
    var bookingTimeStart = roomToBook.substr(roomToBook.indexOf(',') + 1);
    roomToBook = roomToBook.substr(0, roomToBook.indexOf(','));
    bookingTimeStart = bookingTimeStart.substr(0,bookingTimeStart.indexOf(']'));

    var roomInfo = req.db.get('roomDatabase');
    var roomID = parseInt(roomToBook, 10);

    roomInfo.find({RoomID: roomID}).each(function(data, val) {
        var temp = data.Free;
        var success = false;
        var header = "Booking failed";
        var bookMsg = "Sorry, an error occured and the room was not booked.  Please try again later."
        if (temp[bookingTimeStart - 7].free == true)
        {
            temp[bookingTimeStart - 7].free = false;
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


router.get('/', function (req, res, next) {
    // var db = req.db;
    // var roomInfo = db.get('roomInfo');
    // roomInfo.find({}, function(e, result) {
    //     res.render('test', {
    //         room: result
    //     });
    // });

    var roomID = 1;

    var out = {
        room: "Error",
        size: "Error",
        tv: "Error",
        phone: "Error",
        special: "Error",
        tempImgURL: "",
        free: [],
        roomid: roomID,
    };



    var roomInfo = req.db.get('roomDatabase');
    roomInfo.find({RoomID: roomID}).each(function(data, val) {
        out.room = data.Name;
        out.size = data.Description;
        out.tempImgURL = data.Picture;
        out.tv = data.tv;
        out.phone = data.phone;
        out.special = data.special;
        out.free = data.Free;
        out.roomid = roomID;
        res.render('test', out);
    });

});

module.exports = router;