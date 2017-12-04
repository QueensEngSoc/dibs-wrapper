var express = require('express');
var router = express.Router();
var date = '10-23-2017';
var dateOBJ;
var room = 3;
var jsonObj;
var isFreeNow;
var isroomFreeNow = [];
var bookRoomReturnObj = "";

/* GET home page. */
function getDate() {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    dateObj.setDate(dateObj.getDate());
    dateObj.toDateString();
    // console.log("DATE IS: " + dateObj);
    date = (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();
    dateOBJ = dateObj;
}

var http = require('https');

function getRoomData(roomid, roomNum) {
    getDate();
    var url = 'https://queensu.evanced.info/dibsAPI/reservations/' + date + '/' + roomid;
    // console.log("URL IS: ", url);

    http.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var dibsResponse = JSON.parse(body);
            // console.log("Got a response: ", dibsResponse);
            var isFree = checkRoomAvaliable(dibsResponse);
            var roomData = new roomDataObj(isFree, roomid, roomNum);
            //console.log("Room ID: " + roomData.roomid + " Room Number: " + roomData.roomNum + " isFree: " + roomData.isFree);
            isroomFreeNow.push(roomData);
            if (roomid >= 40)
                roomDataCallback();
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
}

function roomDataObj(isFree, roomid, roomNum) {
    this.isFree = isFree;
    this.roomid = roomid;
    this.roomNum = roomNum;
}

function checkRoomAvaliable(json) {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var isFree = true;
    // current_hour = 12;

    for (var booking in json) {
        //console.log("Booking Start: " + booking + ", value: " + JSON.stringify(json[booking]));
        var roomStr = JSON.stringify(json[booking]);
        // console.log("RoomString:\n" + roomStr);
        var start = roomStr.substr(roomStr.indexOf('StartTime') + 12);
        start = start.substr(start.indexOf('T') + 1);
        start = start.substr(0, start.indexOf(':'));
        var end = roomStr.substr(roomStr.indexOf('EndTime') + 6);
        end = end.substr(end.indexOf('T') + 1);
        end = end.substr(0, end.indexOf(':'));

        console.log("Current Hour: " + current_hour + " Start Hour " + start + " End: " + end);
        if ((start <= current_hour && end > current_hour)) {
            // console.log('Found a time!');
            isFree = false;
            break;
        }

        // console.log("\nStartTime " + start + " EndTime " + end + " CurrentHour " + current_hour );
    }

    jsonObj = json;
    bookingCount = Object.keys(json).length;
    //console.log("COUNT: ", bookingCount + " Is the room free: " + isFree);
    isFreeNow = isFree;
    return isFree;
}

function bookRoom(roomId, bookingTimeStart, name, lastname, email, phone) {
    return new Promise(function (resolve, reject) {

        //console.log("date is: " + date);
        var hourMin = " " + bookingTimeStart + ":" + 30 + ":00";
        //console.log("TIME IS: " + date + hourMin);
        var success = checkReservation(name, lastname, phone, email, roomId, date + hourMin, 1);
        if (success)
            console.log("Booked Room " + roomId + " successfully!");
        console.log("Promise complete");
        resolve();
    });
}

const $ = require('najax');

function checkReservation(firstName, lastName, phoneNumber, emailAddress, roomID, dateTime, resLength) {
    return new Promise(function (resolve, reject) {
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
                        bookRoomReturnObj = objReturn;
                        resolve();
                        return true;
                    } else {
                        console.log('Booking Failed: ' + objReturn);
                        bookRoomReturnObj = objReturn;
                        resolve();
                        return true;
                    }
                },
                error: function (xmlHttpRequest) {
                    console.log("SEVERE ERROR trying to contact the dibs server");
                    reject();
                }
            });
        }
    });
}

function getRooms() {
    var url = "https://queensu.evanced.info/dibsAPI/rooms";

    http.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var roomList = JSON.parse(body);
            // console.log("Room list: ", roomList);
            parseRoomList(roomList);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
}

function parseRoomList(roomList) {

    for (var room in roomList) {
        var roomStr = JSON.stringify(roomList[room]);
        var roomID = roomStr.substr(roomStr.indexOf('"RoomID":') + 9);
        roomID = roomID.substr(0, roomID.indexOf('}'));
        var roomName = roomStr.substr(roomStr.indexOf('"Name":') + 11);
        roomName = roomName.substr(0, roomName.indexOf('"'));
        roomName = roomName.replace(/\D/g, '');
        //console.log("Room Info -> Room ID: " + roomID + " Room Name: " + roomName);
        getRoomData(roomID, roomName);
    }
}

function roomDataCallback() {
    // console.log("IS ROOM FREE NOW OBJ: " + isroomFreeNow);
    // isroomFreeNow.sort();
    isroomFreeNow.sort(function (a, b) {
        return (a.roomNum > b.roomNum) ? 1 : ((b.roomNum > a.roomNum) ? -1 : 0);
    });
}

var minutes = 3, the_interval = minutes * 60 * 1000;
setInterval(function () {
    console.log("It's been 3 minutes, update the database");
    isroomFreeNow = [];
    getRooms();
}, the_interval);

getRooms();

router.get('/', function (req, res, next) {
    var string = 'https://queensu.evanced.info/dibs/Login';
    res.render('index', {
        title: 'D!bs 2.0.0.1.a.r1 alpha',
        srcStr: string,
        count: bookingCount,
        jaderoom: room,
        jadedate: date,
        jadeJson: jsonObj,
        jadeRoomFreeNow: isFreeNow,
        jadeRoomStatus: isroomFreeNow
    });

});

router.post('/bookroom', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    roomToBook = roomToBook.substr(roomToBook.indexOf('[') + 1);
    var bookingTimeStart = roomToBook.substr(roomToBook.indexOf(',') + 1);
    roomToBook = roomToBook.substr(0, roomToBook.indexOf(','));
    bookingTimeStart = bookingTimeStart.substr(0,bookingTimeStart.indexOf(']'));

    //console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook);
    bookRoom(roomToBook, bookingTimeStart, "Alex", "", "macsplash3@gmail.com", "").then(function () {
        var header = (bookRoomReturnObj == true) ? "Booking Successful!" : bookRoomReturnObj;
        bookRoomReturnObj = bookRoomReturnObj.substr(bookRoomReturnObj.indexOf("\"Message\":") + 11, bookRoomReturnObj.indexOf('"}'));
        if (bookRoomReturnObj.length < 5)
            bookRoomReturnObj = "Error: Dibs room booking features have been temporarily disabled.  To book a room, please use Dibs :(";
        console.log("Sending: " + header + " -> " + bookRoomReturnObj + " -> ");
        res.send({jadeHeader: header, jadeBookingStatus: bookRoomReturnObj});
    });

});

module.exports = router;
