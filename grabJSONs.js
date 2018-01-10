//code to grab JSONs from dibs API and insert into MongoDB
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomInfo = db.get('roomDatabase');

var request = require('request');
var str = "https://queensu.evanced.info/dibsAPI/rooms";

request(str, function (err, res, body) {
    for (var json in JSON.parse(body)) {
        var data = JSON.parse(body)[json];
        var description = data.Description;
        if (description.indexOf("TV") > 0 || description.indexOf("Projector") > 0)
            data.tv = true;
        else
            data.tv = false;

        if (description.indexOf("Small") >= 0 || description.indexOf("small") >= 0)
            data.size = 0;  // set 0 as small
        else if (description.indexOf("Medium") >= 0)
            data.size = "1";    // set 1 as medium
        else if (description.indexOf("Large") >= 0)
            data.size = 2;  // set 2 as large
        else{
            data.size = 3 // this is room 111, or the "other" type room
            data.special = true;
        }

        if (description.indexOf("phone") >= 0 || description.indexOf("Phone") >= 0)
            data.phone = true;

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
            time: ((7+i)>=10?(7+i):"0"+(7+i))  + ":30 - " + ((8+i)>=10?(8+i):"0"+(8+i)) + ":30",
        };
    }
    return out;
}



