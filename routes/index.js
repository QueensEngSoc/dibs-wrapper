var express = require('express');
var router = express.Router();
var date = '11-29-2017';
var room = 3;
var bookingCount = 'test';
var jsonObj;

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

    var count = 0;
    for (var booking in json){
        console.log("Booking Start: " + booking +", value: " + JSON.stringify(json[booking]));
        count ++;
    }
    jsonObj = json;
    // bookingCount = Object.keys(JSON).length;
    bookingCount = count;
    console.log("COUNT: ", bookingCount);
}

router.get('/', function(req, res, next) {
    var string = 'https://queensu.evanced.info/dibs/Login';
    res.render('index', { title: 'Dibs Wrapper Test', srcStr: string, count: bookingCount, jaderoom: room, jadedate: date, jadeJson: jsonObj});

});

module.exports = router;
