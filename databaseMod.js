var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomInfo = db.get('roomInfo');

var temp = 0;

var cursor = roomInfo.find({});
cursor.each(function(i, val) {
    temp = i.RoomID;
    console.log(temp);
});

function createArray(len, val) {
    var out = new Array(len);
    for (var i = 0; i < len; i++) {
        out[i] = val;
    }
    return out;
}
