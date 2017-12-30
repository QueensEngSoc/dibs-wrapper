//code to grab JSONs from dibs API and insert into MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomInfo = db.get('roomInfo');

var request = require('request');
var str = "https://queensu.evanced.info/dibsAPI/rooms";

request(str, function (err, res, body) {
    for (var json in JSON.parse(body)) {
        var data = JSON.parse(body)[json];
        data.Free = createArray(16, true);
        roomInfo.insert(data);
        console.log(data);
    }
});

function createArray(len, val) {
    var out = new Array(len);
    for (var i = 0; i < len; i++) {
        out[i] = {
            free: val,
            time: ((7+i)>=10?(7+i):"0"+(7+i))  + ":30 - " + ((8+i)>=10?(8+i):"0"+(8+i)) + ":30"
        };
    }
    return out;
}

