// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../models/userFunctions');
var roomBook = require('../models/roomBooking');
var consts = require('../config/config');
var email = require('../models/sendEmail');
var prefGetter = require('../models/preferences');

router.post('/accounts/unbook', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    var obj = JSON.parse(roomToBook);
    var bookingTimeStart = parseInt(obj.time);

    var roomid = parseInt(obj.roomID, 10);
    var usrid = accountFuncs.getUserID(req);

    if (usrid !== -1) {
        if (roomid >= 0) {
            roomBook.unbookRoom(0, bookingTimeStart, 1, roomid, usrid, req).then(function (data) { // day, time, length, roomID, usrid
                console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomid + " Success" + data.success);
                res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
            });
        } else {
            var date = new Date();
            var current_hour = date.getHours();

            var unbookAll = new Promise(function (resolve, reject) {
                roomFuncs.getListOfRoomsForUser(usrid).then(function (rooms) {
                    for (var room of rooms) {
                        roomBook.unbookAllForUser(room.intDay, room.roomid, usrid, req).then(function (success) {
                        });
                    }
                    if (rooms.length == 0)  // something went wrong, so let's reset the booking count to 0, since the user has no rooms booked at the moment
                        accountFuncs.resetBookingCount(req);

                    resolve("Successful unbooking!");
                });
            });

            unbookAll.then(function (data) {
                res.send({
                    HeaderMsg: 'Unbooking Success!',
                    BookingStatusMsg: 'Unbooking successful for all reservations',
                    BookStatus: true
                });
            });
        }
    }
});

router.get('accounts/sendverification', function (req, res, next) {
    var usrid = accountFuncs.getUserID(req);
    if (usrid == -1 || usrid == undefined)
        return res.redirect('/login');
    else {
        if (!req.user.local.verified) {
            email.sendVerificationMail(req.user.local.email, consts.fromEmail, req.user.local.verify_token, req);
        }
    }
});

router.get('/accounts', function (req, res, next) {
    var usrid = accountFuncs.getUserID(req);

    var msg = req.flash('bookingMessage');
    // var bookingLimit = consts.room_booking_limit;    // by room bookings
    var bookingLimit = consts.room_hour_limit;          // by hour bookings

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
            var day = 0;//var day = parseInt(length.substr(length.indexOf('-') + 1));
            length = parseInt(length.substr(0, length.indexOf('-')), 10);

            roomBook.bookRoom(day, bookingTimeStart, roomID, length, usrid, req).then(function (data) {
                console.log("Data! " + data);
                json = JSON.stringify(data);
                roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {
                    var free = listBookings[day];
                    if (free != undefined) {
                        for (var i = 7; i < 23; i++) {
                            if (free.free[day][i].owner == req.user.id) {

                            }

                        }
                    }

                    res.render('accountPage', {    // render the page with server side variables passed to the client
                        user: req.user,
                        booking: listBookings,
                        json: json,
                        bookingLimit: bookingLimit,
                        bookingsLeft: bookingLimit - req.user.local.booking_count,
                        hasJson: true,
                        theme: req.theme === "custom" ? false : req.theme,
                        colors: req.colors
                    });

                });

            });
        }
        else {
            roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

                var free = listBookings;
                if (free != undefined) {
                    for (var day = 0; day < listBookings.length; day++) {
                        var hash = "";
                        var length = 1;
                        var start = 0;
                        var end = 16;
                        for (var i = 0; i < end; i++) {
                            if (free[day].free[i].owner == req.user.id) {
                                var length = 0;
                                var index = i + 1;
                                while (index < end && free[day].free[index++].owner == req.user.id) {
                                    length++;
                                }
                                if (i + 1 < end)
                                    free[day].free.splice(i + 1, length);
                                end -= length;
                                var time = free[day].free[i].time;
                                free[day].free[i].time = updateTime(time, length);
                                free[day].free[i].length = length + 1;
                            }
                        }
                    }
                }

                res.render('accountPage', {    // render the page with server side variables passed to the client
                    user: req.user,
                    booking: listBookings,
                    json: json,
                    bookingLimit: bookingLimit,
                    bookingsLeft: bookingLimit - req.user.local.booking_count,
                    hasJson: false,
                    theme: req.theme === "custom" ? false : req.theme,
                    colors: req.colors
                });

            });
        }
    }

})
;

function updateTime(time, length) {
    var pos = getPosition(time, '-', 1);        // get the position of the second - in the string
    var tempStr = time.substr(pos + 2);         // get the substring of the pos + 2 (the start of the ending hour)
    var colnPos = getPosition(tempStr, ':', 1); // get the pos of the colon (to determine if the time is 1 or 2 digits long
    var endStr = tempStr;                       // save this ending string, we need it for later
    tempStr = tempStr.substr(0, colnPos);       // cut the substring to the colon posistion, leaving the time
    var timeInt = parseInt(tempStr, 10);        // turn the time to an int
    timeInt += length;                                  // add one
    time = time.substr(0, pos + 2) + timeInt + endStr.substr(colnPos);  // add everything back into a single string
    return time;
}

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

module.exports = router;