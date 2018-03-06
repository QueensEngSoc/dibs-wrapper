var express = require('express');
var router = express.Router();
var accountFuncs = require('../models/userFunctions');
var roomBook = require('../models/roomBooking');

router.post('/bookroom', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    var obj = JSON.parse(roomToBook);

    var bookingTimeStart = parseInt(obj.time, 10);
    var roomID = parseInt(obj.roomID, 10);
    var usrid = accountFuncs.getUserID(req);
    var day = parseInt(obj.day, 10);
    var length = parseInt(obj.length, 10);

    if (usrid == -1 || usrid == undefined) {
        res.send({
            HeaderMsg: "You must login",
            BookingStatusMsg: ' ',
            BookStatus: false
        });
    }
    else {
        roomBook.bookRoom(day, bookingTimeStart, roomID, length, usrid, req).then(function (data) {
            console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook + " Success: " + data.success);
            res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
        });
    }
});

module.exports = router;