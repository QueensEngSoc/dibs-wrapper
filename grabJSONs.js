//code to grab JSONs from dibs API and insert into MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomInfo = db.get('roomInfo');

var request = require('request');
var str = "https://queensu.evanced.info/dibsAPI/rooms";

request(str, function (err, res, body) {
    for (var json in JSON.parse(body)) {
        roomInfo.insert(JSON.parse(body)[json]);
        console.log(JSON.parse(body)[json]);
    }
});
