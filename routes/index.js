var express = require('express');
var router = express.Router();
var date = '10-19-2017';
var room = 3;
var bookingCount = 'test';

/* GET home page. */

var http = require('https');
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

function checkRoomAvaliable(JSON){

    var date = new Date();
    var current_hour = date.getHours();

    for (var booking in JSON){
        console.log("Booking Start: " + booking +", value: " + booking['StartTime']);
    }

    bookingCount = Object.keys(JSON).length;
    console.log("COUNT: ", bookingCount);
}

router.get('/', function(req, res, next) {
    var string = 'https://queensu.evanced.info/dibs/Login';
    res.render('index', { title: 'Dibs Wrapper Test', srcStr: string, count: bookingCount, jaderoom: room, jadedate: date});

});

module.exports = router;
