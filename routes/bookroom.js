var express = require('express');
var http = require('https');
const $ = require('najax');

var router = express.Router();
var date = '10-23-2017';// stores the current date in the expected string format for dibs
var dateOBJ;            // stores the current date in an object for future modification
var room = 3;           // the room id.  Default is "3", however this is immediately changed on page load using the value in the URL
var bookingCount = '0'; // total amount of bookings for the day
var isFreeNow;          // simple flag to show if the room is currently free
var roomName = 0;       // stores the room number, or friendly name (NOT THE ID)
var roomPicUrl = "";    // stores the url for the room image
var roomBookings = [];  // stores the list of the nicely formatted room bookings
var allRoomBookingTimes = [];

/**
 * gets the current date, and sets the global date variable to the current date
 */
function getDate() {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    dateObj.setDate(dateObj.getDate());
    dateObj.toDateString();
    console.log("DATE IS: " + dateObj);
    date = (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();
    dateOBJ = dateObj;
}

/**
 * This is the roomDataObj that is used to store the booking data to be displayed in Jade.
 * @param isFree
 * @param roomid
 * @param roomNum
 * @param bookingStart
 * @param bookingEnd
 */
function roomBookingObj(isFree, roomid, roomNum, bookingStart, bookingEnd, length) {
    this.isFree = isFree;
    this.roomid = roomid;
    this.roomNum = roomNum;
    this.bookingStart = bookingStart;
    this.bookingEnd = bookingEnd;
    this.bookingLength = length;
}

/**To make Michael happy, here are some comments
 * checks to see if a room is currently available.
 * Returns true if the room is free, and also goes through the JSON, converting the 24h times to standard 12h
 * @param json
 */
function checkRoomAvaliable(json) {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var isFree = true;

    var allPossibleStartTimes = [];

    for (var i = 7; i < 23; i++) {
        allPossibleStartTimes[i] = true; // set all times to be free initially
    }

    for (var booking in json) {
        // this function simply gets the JSON object, loops through each contained JSON object for each booking
        // then it parses out the start and end times from the JSON object.  It then changes the 24h times to 12h
        // (cause I don't wanna do math to see if this worked properly), and adds it to the list of bookings for that room

        //console.log("Booking Start: " + booking + ", value: " + JSON.stringify(json[booking]));
        var roomStr = JSON.stringify(json[booking]);
        //console.log("RoomString:\n" + roomStr);
        var start = roomStr.substr(roomStr.indexOf('StartTime') + 12);
        start = start.substr(start.indexOf('T') + 1);
        start = start.substr(0, start.indexOf(':'));
        var end = roomStr.substr(roomStr.indexOf('EndTime') + 6);
        end = end.substr(end.indexOf('T') + 1);
        end = end.substr(0, end.indexOf(':'));

        if ((start <= current_hour && end > current_hour)) {
            console.log('Found a time!');
            isFree = false;
        }

        //console.log("Start: " + start +" End: " + end + " (12h) Start: " + (start - 12) + " end: " + (end - 12));

        for (var i = start; i < end; i++) { // there is currently an odd bug with rooms booked in the morning, for some reason this does not catch them
            // properly, and thus shows the room as free.  One example of this is room 317 (ID 29) on 11/20/2017, with the booking from 7:30AM to 10:30PM
            allPossibleStartTimes[i] = false;
            //console.log("i: " + i + " isTrue " + allPossibleStartTimes[i]);
        }

        var length = end - start;
        if (start > 12)
            start = start - 12 + ":30PM";
        else
            start = start + ":30AM";
        if (end > 12) {
            end = end - 12 + ":30PM";
        }
        else
            end += ":30AM";

        var booking = new roomBookingObj(isFree, room, roomName, start, end, length);
        console.log("Room ID: " + booking.roomid + " Room Number: " + booking.roomNum + " isFree: " + booking.isFree + " start time: " + booking.bookingStart + " end time: " + booking.bookingEnd);

        roomBookings.push(booking);
    }

    bookingCount = Object.keys(json).length;    // count how many objects are present in the JSON object, and set BookingCount to that
    //console.log("COUNT: ", bookingCount + " Is the room free: " + isFree);
    isFreeNow = isFree;

    roomBookings.sort(function (a, b) {
        // do some magical sort that I found on StackOverflow.
        // This sorts by the booking start time, and sorts from lowest to highest.  The whole AM / PM thing might break it though :(
        return (a.bookingStart > b.bookingStart) ? 1 : ((b.bookingStart > a.bookingStart) ? -1 : 0);
    });

    console.log("All Booking Times: " + allPossibleStartTimes +  " count: " + allPossibleStartTimes.length);
    for (var i = 7; i < allPossibleStartTimes.length; i++){
        console.log("Start: " + (i) + " isFree: " + allPossibleStartTimes[i]);
    }

    allRoomBookingTimes = allPossibleStartTimes;
}

/**
 * Books a room through the D!bs POST function (Thanks Andrew and Michael!)
 * This is currently unused since the same function is present in index, and due to dynamic routing, the post
 * request checking was unhappy being on this page
 * @param roomId
 * @returns {string}
 */
function bookRoom(roomId) {
    console.log("date is: " + date)
    checkReservation("Alex", "", "", "14ar75@queensu.ca", roomId, date, 1);
    console.log("Booked Room " + roomId + " successfully!");
    return "true";
}

function checkReservation(firstName, lastName, phoneNumber, emailAddress, roomID, dateTime, resLength) {
    var dibsWSURL = 'https://queensu.evanced.info/admin/dibs/api/reservations/post';
    var reservationSent = false;
    if (!reservationSent) {
        reservationSent = true;

        var postData = {
            firstName: firstName,
            lastName: lastName,
            roomid: roomID,
            startDate: dateTime,
            reservationLength: resLength,
            phoneNumber: phoneNumber,
            emailAddress: emailAddress,
            langCode: "en-US",
            staffAccess: false
        };

        $.post({
            url: dibsWSURL,
            data: JSON.stringify(postData),
            contentType: "application/json; charset=utf-8",
            async: true,
            success: function (objReturn) {
                if (objReturn.IsSuccess === true) {
                    console.log('Submitted!');
                } else {
                    console.log('Booking Success: ' + objReturn);
                }
            },
            error: function (xmlHttpRequest) {
                console.log("SEVERE ERROR trying to contact the dibs server");
            }
        });
    }
}

// '/book/'+ roomName + '-' + room + '/bookroom
// router.post('/bookroom', function (req, res) {
//     console.log("hey, this worked!");
//
//     var postUrl = bookRoom(room);
//     res.send(postUrl);
//
// });
//
// req.params.uid + ' with id ' + req.params.roomID

/**
 * Pretty self explanatory, gets the url for the room image, given a room ID as a parameter
 * then sets the global room picture variable to the correct path
 * @param room
 */
function getRoomPicture(room) {
    return new Promise(function (resolve, reject) {
        var url = "https://queensu.evanced.info/dibsAPI/rooms/" + room;

        http.get(url, function (res) {
            var body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                var roomList = JSON.parse(body);
                var roomStr = JSON.stringify(roomList);
                roomStr = roomStr.substr(roomStr.indexOf("\"Picture\":\"") + 11);
                roomStr = roomStr.substr(0, roomStr.indexOf("\""));
                console.log(roomStr);
                roomPicUrl = roomStr;
                //console.log("got room url!");
                resolve();
            });
        }).on('error', function (e) {
            console.log("Got an error: ", e);
            reject();
        });
    })
}

/**
 * Gets the json object back from the D!bs API request, and then calls the parsing function
 */
function getUsefulStuff() {
    return new Promise(function (resolve, reject) {
        var url = 'https://queensu.evanced.info/dibsAPI/reservations/' + date + '/' + room;
        console.log("URL IS: ", url);
        http.get(url, function (httpres) {
            var body = '';

            httpres.on('data', function (chunk) {
                body += chunk;
            });

            httpres.on('end', function () {
                var dibsResponse = JSON.parse(body);
                //console.log("Got a response: ", dibsResponse);
                checkRoomAvaliable(dibsResponse);
                resolve();
            });
        }).on('error', function (e) {
            console.log("Got an error: ", e);
            res.send('error');
            reject();
        });
    })
}

router.get('/book/:uid-:roomID/', function (req, res, next) {
    room = req.params.roomID;
    roomName = req.params.uid;
    roomBookings = [];
    console.log("\n\nNow On Booking Page For Room: " + room);
    getDate();
    console.log("Room Bookings for Today: " + roomBookings.toString());
    getUsefulStuff(room).then(function () {
        return getRoomPicture(room);
    }).then(function () {
        res.render('bookroom', {
            title: 'Details for Room ' + req.params.uid,
            count: bookingCount,
            jaderoom: req.params.uid,
            jadedate: date,
            jadeRoomPicUrl: roomPicUrl ? roomPicUrl : 'https://thumb7.shutterstock.com/display_pic_with_logo/2892448/486584521/stock-vector-retro-man-with-a-beer-pop-art-vector-beer-pubs-and-bars-retro-advertising-of-alcoholic-beverages-486584521.jpg',
            jadeJson: roomBookings,
            jadeRoomFreeNow: isFreeNow,
            jadeRoomID: req.params.roomID,
            jadeRoomBookings: allRoomBookingTimes
        });
    }).catch(function () {
        res.send('err');
    })


});

module.exports = router;
