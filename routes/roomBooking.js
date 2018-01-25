var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomDatabase = db.get('roomDatabase');

//use is same as roomDatabase

/**
 *
 * @param day
 * @param time
 * @param roomID
 * @param usrid
 * @returns {promise}
 */
function bookRoom(day, time, roomID, usrid) { //books a room at a certain time and day and sets the owner to be the usrid
    return new Promise(function(resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function (data, val) {
            var temp = data.Free;
            var out = {
                header: "Booking failed",
                bookMsg: "Sorry, an error occured and the room was not booked.  Please try again later.",
                success: false
            };
            if (temp[time - 7].free === true) {
                temp[time - 7].free = false;
                temp[time - 7].owner = usrid;

                roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});
                out.success = true;
                out.bookMsg = "Booking successful for " + data.Name + " at " + time + ":30";
                out.header = "Booking Success!";
            }
            else {
                out.bookMsg = "Sorry, this room is booked.  Looks like someone beat you to it :(";
                out.header = "Room Already Booked"
            }

            resolve(out);

        });
    });
}

module.exports = {
    bookRoom: bookRoom
};