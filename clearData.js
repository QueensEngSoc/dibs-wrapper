var stdin = process.openStdin();
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomInfo = db.get('roomDatabase');

//This no
console.log("This .js file clears the booked times for the day, for a given roomID");
console.log("This is for debugging purposes, DO NOT DO THIS ON A PRODUCTION SERVER!!!!");
console.log("IT WILL REMOVE BOOKINGS FOR THE ENTIRE DAY!\n\n");
console.log("Do you still want to continue?\nType 'yes' to continue");


stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
if (d.toString().indexOf("yes") >= 0)
{
    console.log("Great! \nEnter the roomID that you wish to clear: ");
    stdin.addListener("data", function(d) {
        roomID = d.toString();
        var free = createArray(16, true);
        roomInfo.update({RoomID: roomID}, {$set: {Free: free}});
        console.log("Done!  Room " + roomID + " has been cleared!");
        console.log("\n\nGoodbye!");
        process.exit(0);
    });
}
});

function createArray(len, val) {
    var out = new Array(len);
    for (var i = 0; i < len; i++) {
        out[i] = {
            free: val,
            time: ((7+i)>=10?(7+i):"0"+(7+i))  + ":30 - " + ((8+i)>=10?(8+i):"0"+(8+i)) + ":30",
            startTime: 7+i,
        };
    }
    return out;
}
