var express = require('express');
var router = express.Router();
var accountFuncs = require('../models/userFunctions');
var roomBook = require('../models/roomBooking');

router.post('/bookcheckout', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    var obj = JSON.parse(roomToBook);

    var roomID = parseInt(obj.roomID, 10);
    var usrid = accountFuncs.getUserID(req);
    var day = parseInt(obj.day, 10);
    var times = obj['times[]'];
    if (Array.isArray(times)) {
        for (var i in times) {
            times[i] = parseInt(times[i], 10);
        }
    } else {
        var temp = [];
        temp.push(times);
        times = temp;
    }

    if (usrid === -1 || usrid === undefined) {
        res.send({
            HeaderMsg: "You must login",
            BookingStatusMsg: roomID + "-" + times[0] + "-" + 1 + "-" + day,
            BookStatus: false
        });
    } else {
        book(day, times, roomID, usrid, req, res);
    }
});

function book(day, times, roomID, usrid, req, res) {
    roomBook.bookMultiple(day, times, roomID, usrid, req).then(function (data) {
        console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomID + " Success: " + data.success);
        res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
    });
}

module.exports = router;