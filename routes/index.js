var express = require('express');
var router = express.Router();
var date = '10-23-2017';
var room = 3;
var bookingCount = 'test';
var jsonObj;
var isFreeNow;

/* GET home page. */
function getDate(){
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    dateObj.setDate(dateObj.getDate() + 2);
    dateObj.toDateString();
    console.log("DATE IS: " + dateObj);
    date = (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();

}

var http = require('https');
getDate();
var url = 'https://queensu.evanced.info/dibsAPI/reservations/' + date + '/' + room;
console.log("URL IS: ", url);

http.get(url, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var dibsResponse = JSON.parse(body);
        console.log("Got a response: ", dibsResponse);
        checkRoomAvaliable(dibsResponse);
    });
}).on('error', function(e){
    console.log("Got an error: ", e);
});

function checkRoomAvaliable(json){
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var isFree = true;


    for (var booking in json){
        console.log("Booking Start: " + booking +", value: " + JSON.stringify(json[booking]));
        var roomStr = JSON.stringify(json[booking]);
        console.log("RoomString:\n" + roomStr);
        var start = roomStr.substr(roomStr.indexOf('StartTime') + 12);
        start = start.substr(start.indexOf('T') +1);
        start = start.substr(0, start.indexOf(':'));
        var end = roomStr.substr(roomStr.indexOf('EndTime') + 6);
        end = end.substr(end.indexOf('T') +1);
        end = end.substr(0, end.indexOf(':'));

        if((start <= current_hour && end > current_hour)){
            console.log('Found a time!');
            isFree = false;
            break;
        }

        console.log("\nStartTime " + start + " EndTime " + end + " CurrentHour " + current_hour );
    }

    jsonObj = json;
    bookingCount = Object.keys(json).length;
    // bookingCount = Object.keys(JSON).length;
    console.log("COUNT: ", bookingCount + " Is the room free: " + isFree);
    isFreeNow = isFree;
}

router.get('/', function(req, res, next) {
    var string = 'https://queensu.evanced.info/dibs/Login';
    res.render('index', { title: 'Dibs Wrapper Test', srcStr: string, count: bookingCount, jaderoom: room, jadedate: date, jadeJson: jsonObj, jadeRoomFreeNow: isFreeNow});

});

module.exports = router;
