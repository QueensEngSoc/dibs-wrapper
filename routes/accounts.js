// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var path = require('path');
var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../models/userFunctions');
var roomBook = require('../models/roomBooking');
var consts = require('../config/config');


router.post('/accounts/unbook', function (req, res) {
    var roomToUnbook = JSON.stringify(req.body);
    roomToUnbook = roomToUnbook.substr(roomToUnbook.indexOf('[') + 1);
    var bookingTimeStart = roomToUnbook.substr(roomToUnbook.indexOf(',') + 1);
    roomToUnbook = roomToUnbook.substr(0, roomToUnbook.indexOf(','));
    bookingTimeStart = bookingTimeStart.substr(0, bookingTimeStart.indexOf(','));

    var roomNum = roomToUnbook.trim().match(/\d+/)[0] // get the number from the room
    var roomid = parseInt(roomNum, 10);
    if (roomToUnbook.trim() == "-1") {
        roomid = -1;
    }
    var usrid = accountFuncs.getUserID(req);

    if (usrid != -1) {
        if (roomid >= 0) {
            roomBook.unbookRoom(0, bookingTimeStart, 1, roomid, usrid).then(function (data) { // day, time, length, roomID, usrid
                console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToUnbook + " Success" + data.success);
                res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
            });
        } else {
            var date = new Date();
            var current_hour = date.getHours();

            var unbookAll = new Promise(function(resolve, reject) {
                roomFuncs.getListOfRoomsForUser(usrid).then(function(rooms) {
                    for (var room of rooms) {
                        roomBook.unbookAllForUser(0, current_hour, room.roomid, usrid).then(function(success) {
                        });
                    }
                    resolve("Successful unbooking!");
                });
            });

            unbookAll.then(function(data) {
                console.log(data);
                res.send({HeaderMsg: 'Unbooking Success!', BookingStatusMsg: 'Unbooking successful for all reservations', BookStatus: true});
            });
        }
    }
});

router.get('/accounts', function (req, res, next) { //the request to render the page

    // if (req.)
    var usrid = accountFuncs.getUserID(req);

    var msg = req.flash('bookingMessage');
    var hasMsg = false;
    var bookingLimit = consts.room_booking_limit;

    if (usrid == -1 || usrid == undefined)
        return res.redirect('/login');
    else {
        var json = "";

        if (msg != undefined && msg.length > 0) {   // roomID + "-" + bookingTimeStart + "-" + length + "-" + day is the order of data
            var msgTxt = msg[0];
            var roomID = parseInt(msgTxt.trim().match(/\d+/)[0]);
            msgTxt = msgTxt.substr(msgTxt.indexOf('-') + 1);
            var query = msgTxt;
            var bookingTimeStart = parseInt(query.substr(0, query.indexOf('-')), 10);
            var length = query.substr(query.indexOf('-') + 1);
            var day = parseInt(length.substr(length.indexOf('-') + 1));
            length = parseInt(length.substr(0, length.indexOf('-')), 10);

            roomBook.bookRoom(day, bookingTimeStart, roomID, length, usrid, req).then(function (data) {
                console.log("Data! " + data);
                json = JSON.stringify(data);
                roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

                    res.render('accountPage', {    // render the page with server side variables passed to the client
                        user: req.user,
                        booking: listBookings,
                        json: json,
                        bookingLimit: bookingLimit,
                        bookingsLeft: bookingLimit - req.user.local.booking_count,
                        hasJson: true,
                        navLink: '<a href="/" style="color: #fff;">GRID</a>',
                        navPic: '<a href="/" style="padding-top: 5px;"><img src="/img/grid.png" height="30" width="30"></a>'
                    });

                });

            });
        }
        else {
            roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

                res.render('accountPage', {    // render the page with server side variables passed to the client
                    user: req.user,
                    booking: listBookings,
                    json: json,
                    bookingLimit: bookingLimit,
                    bookingsLeft: bookingLimit - req.user.local.booking_count,
                    hasJson: false,
                    navLink: '<a href="/" style="color: #fff;">GRID</a>',
                    navPic: '<a href="/" style="padding-top: 5px;"><img src="/img/grid.png" height="30" width="30"></a>'
                });

            });
        }
    }

})
;

module.exports = router;