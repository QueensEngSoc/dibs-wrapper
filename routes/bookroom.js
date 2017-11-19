var express = require('express');
var http = require('https');
const $ = require('najax');

var router = express.Router();
var date = '10-23-2017';
var dateOBJ;
var room = 3;
var bookingCount = '0';
var jsonObj;
var isFreeNow;
var roomName = 0;
var roomPicUrl = "";

/* GET home page. */
function getDate() {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    dateObj.setDate(dateObj.getDate() + 2);
    dateObj.toDateString();
    console.log("DATE IS: " + dateObj);
    date = (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();
    dateOBJ = dateObj;
}

function checkRoomAvaliable(json) {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var isFree = true;


    for (var booking in json) {
        console.log("Booking Start: " + booking + ", value: " + JSON.stringify(json[booking]));
        var roomStr = JSON.stringify(json[booking]);
        console.log("RoomString:\n" + roomStr);
        var start = roomStr.substr(roomStr.indexOf('StartTime') + 12);
        start = start.substr(start.indexOf('T') + 1);
        start = start.substr(0, start.indexOf(':'));
        var end = roomStr.substr(roomStr.indexOf('EndTime') + 6);
        end = end.substr(end.indexOf('T') + 1);
        end = end.substr(0, end.indexOf(':'));

        if ((start <= current_hour && end > current_hour)) {
            console.log('Found a time!');
            isFree = false;
            break;
        }

        console.log("\nStartTime " + start + " EndTime " + end + " CurrentHour " + current_hour);
    }

    jsonObj = json;
    bookingCount = Object.keys(json).length;
    console.log("COUNT: ", bookingCount + " Is the room free: " + isFree);
    isFreeNow = isFree;
}

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

function getRoomPicture(room) {
    return new Promise(function(resolve, reject) {
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
                console.log("got room url!");
                resolve();
            });
        }).on('error', function (e) {
            console.log("Got an error: ", e);
            reject();
        });
    })
}

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
                console.log("Got a response: ", dibsResponse);
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

    getDate();
    // console.log(router.get("roomID") + "RoomID");
    getUsefulStuff(room).then(function() {
        return getRoomPicture(room);
    }).then(function() {
        res.render('bookroom', {
            title: 'Details for Room ' + req.params.uid,
            count: bookingCount,
            jaderoom: req.params.uid,
            jadedate: date,
            jadeRoomPicUrl: roomPicUrl ? roomPicUrl : 'https://thumb7.shutterstock.com/display_pic_with_logo/2892448/486584521/stock-vector-retro-man-with-a-beer-pop-art-vector-beer-pubs-and-bars-retro-advertising-of-alcoholic-beverages-486584521.jpg',
            jadeJson: jsonObj,
            jadeRoomFreeNow: isFreeNow,
            jadeRoomID: req.params.roomID
        });
    }).catch(function() {
        res.send('err');
    })


});

module.exports = router;
