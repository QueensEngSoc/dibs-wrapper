var stdin = process.openStdin();
var monk = require('monk');var env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
    var db = monk('localhost:27017/roomDatabase');
else
    var db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');

var roomDatabase = db.get('roomDatabase');
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them

//This no -- but terminal esque programs are soo much fun :)
console.log("This .js file clears the booked times for the day, for a given room number");
console.log("This is for debugging purposes, DO NOT DO THIS ON A PRODUCTION SERVER!!!!");
console.log("IT WILL REMOVE BOOKINGS FOR THE ENTIRE DAY!\n\n");
console.log("Do you still want to continue?\nType 'yes' to continue");


stdin.addListener("data", function (d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    if (d.toString().indexOf("yes") >= 0) {
        console.log("Great! \nEnter the room number you wish to clear (eg: 111): ");
        stdin.addListener("data", function (d) {
            // var d = 128;
            var roomNumStr = d.toString();
            var roomNum = parseInt(roomNumStr.match(/\d+/)[0]);

            roomDB.getInfoByName("BMH " + roomNum).then(function (out) {
                var roomID = out.roomid;

                roomDatabase.find({RoomID: roomID}).each(function (data, val) {
                    var temp = data.Free[day];
                    var out = {
                        success: false
                    };

                    for (var i = 7; i < 23; i++) {
                        temp[i - 7].free = true;
                        temp[i - 7].owner = 0;
                        out.success = true;
                    }

                    roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});
                    console.log("Done!  Room " + roomID + " (" + data.Name + ") has been cleared!");
                    console.log("\n\nGoodbye!");
                    setTimeout(killProcess, 2000);  // the delay ensures that the DB has been fully written to prior to
                                                    // ending the process, this was the reason as to why this function
                                                    // was not working before :(
                });

            });
        });
    }
});

function killProcess() {
    process.exit(0);
}