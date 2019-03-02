var express = require('express');
var router = express.Router();
var accountFuncs = require('../src/lib/userFunctions');
var roomBook = require('../models/roomBooking');

router.post('/bookcheckout', function (req, res) { //similar to the book function with a few changes which will be commented below
    var roomToBook = JSON.stringify(req.body);
    var obj = JSON.parse(roomToBook);

    var roomID = parseInt(obj.roomID, 10);
    var usrid = accountFuncs.getUserID(req);
    var day = parseInt(obj.day, 10);
    var times = obj['times[]']; //get the array of times (instead of a singular one)
    if (Array.isArray(times)) { //make sure it's an array
        for (var i in times) {
            times[i] = parseInt(times[i], 10);
        }
    } else {
        var temp = [];
        temp.push(times);
        times = temp;
    }

    if (usrid === -1 || usrid === undefined) {
        req.flash('bookingMessage', roomToBook);
        res.send({
            HeaderMsg: "You must login",
            BookingStatusMsg: roomID + "-" + times[0] + "-" + 1 + "-" + day,
            BookStatus: false
        });
    } else {
        book(day, times, roomID, usrid, req, res); //the function to book the room
    }
});

function book(day, times, roomID, usrid, req, res) {
    roomBook.bookMultiple(day, times, roomID, usrid, req).then(function (data) { //Similar to the bookRoom function with a few minor differences
        console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomID + " Success: " + data.success);
        res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
    });
}

export default router;
