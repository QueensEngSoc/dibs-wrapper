// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var path = require('path');
var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../models/userFunctions');
var roomBook = require('../models/roomBooking');


router.post('/accounts/unbook', function (req, res) {
    var roomToUnbook = JSON.stringify(req.body);
    roomToUnbook = roomToUnbook.substr(roomToUnbook.indexOf('[') + 1);
    var bookingTimeStart = roomToUnbook.substr(roomToUnbook.indexOf(',') + 1);
    roomToUnbook = roomToUnbook.substr(0, roomToUnbook.indexOf(','));
    bookingTimeStart = bookingTimeStart.substr(0,bookingTimeStart.indexOf(','));

    var roomNum = roomToUnbook.trim().match(/\d+/)[0] // get the number from the room
    var roomid = parseInt(roomNum, 10);
    var usrid = accountFuncs.getUserID(req);

    if (usrid != -1) {
        roomBook.unbookRoom(0, bookingTimeStart, roomid, usrid).then(function (data) {
            console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToUnbook + " Success" + data.success);
            res.send({HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success});
        });
    }
});

router.get('/accounts', function (req, res, next) { //the request to render the page

    var usrid = accountFuncs.getUserID(req);
    if (usrid == -1 || usrid == undefined)
        res.redirect('/login');
    else {
        roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

            res.render('accountPage', {    // render the page with server side variables passed to the client
                user: req.user,
                booking: listBookings
            });

        });
    }

});

module.exports = router;