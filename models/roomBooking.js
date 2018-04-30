var monk = require('monk');
var env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
    var db = monk('localhost:27017/roomDatabase');
else
    var db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');
var roomDatabase = db.get('roomDatabase');
var userFuncs = require('../models/userFunctions');
var consts = require('../config/config');
var randomstring = require("randomstring"); // used to generate the random hash to see if the room is part of the same booking

//use is same as roomDatabase


/**
 *
 * @param day
 * @param time
 * @param roomID
 * @param usrid
 * @returns {promise}
 */
//OUT OF DATE, DO NOT USE!!!! USE bookMultiple
function bookRoom(day, time, roomID, length, usrid, req) { //books a room at a certain time and day and sets the owner to be the usrid
    return new Promise(function (resolve, reject) {

        if (!userFuncs.canBookMoreRooms(req)) {
            var out = {
                header: "Booking failed",
                bookMsg: "Sorry, You have booked too many rooms.  There are a max of " + consts.room_booking_limit + " room bookings allowed.",
                success: false
            };

            resolve(out);
            return;
        }

        roomDatabase.find({RoomID: roomID}).each(function (data, val) {
            var temp = data.Free;
            var out = {
                header: "Booking failed",
                bookMsg: "Sorry, an error occured and the room was not booked.  Please try again later.",
                success: false
            };

            var end = length + parseInt(time, 10);
            var bookingHash = randomstring.generate({
                length: 5
            });

            for (var i = time; i < end; i++) {
                if (temp[day][i - 7].free === true) {
                    temp[day][i - 7].free = false;
                    temp[day][i - 7].owner = usrid;
                    temp[day][i - 7].bookingHash = bookingHash;
                }
                else {
                    out.bookMsg = "Sorry, this room is booked.  Looks like someone beat you to it :(";
                    out.header = "Room Already Booked"
                    resolve(out);
                }
            }
            if (userFuncs.updateBookingCount(1, req)) {
                roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});
                out.success = true;
                out.bookMsg = "Booking successful for " + data.Name + " from " + time + ":30 - " + (time + length) + ":30";
                out.header = "Booking Success!";
                resolve(out);

            }
            else {
                out = {
                    header: "Booking failed",
                    bookMsg: "Sorry, an error occured and the room was not booked.  Please try again later.",
                    success: false
                };
                resolve(out);

            }
            resolve(out);


        });
    });
}

function bookMultiple(day, times, roomID, usrid, req) {
    return new Promise(function (resolve, reject) {

        if (usrid !== "admin") {
            if (!userFuncs.canBookMoreRooms(req)) {
                var out = {
                    header: "Booking failed",
                    bookMsg: "Sorry, You have booked too many hours.  There are a max of " + consts.room_hour_limit + " hours allowed.",
                    success: false,
                    day: day
                };

                resolve(out);
                return;
            }
        }

        roomDatabase.find({RoomID: roomID}).each(function (data, val) {
            var temp = data.Free;
            var out = {
                header: "Booking failed",
                bookMsg: "Sorry, an error occured and the room was not booked.  Please try again later.",
                success: false,
                day: day
            };

            var bookingHash = randomstring.generate({
                length: 5
            });
            var numBooked = 0;
            var totalBooked = 0;
            var dayData = data.Free[day];
            totalBooked = getTotalBookedHoursPerRoom(totalBooked, dayData, usrid);
            if (consts.per_room_limit - totalBooked <= 0) {
                out.bookMsg = "Sorry, you can only book " + consts.per_room_limit + " hours per day in a single room";
                out.header = "Max of " + consts.per_room_limit + " hours per room";
                resolve(out);
                return;
            }

            for (var time of times) { //iterate over an array of times instead of a sequence of numbers
                if (usrid !== "admin") {
                    if (temp[day][time - 7].free === true) {
                        if (consts.per_room_limit - totalBooked - numBooked <= 0) {
                            break;
                        }
                        temp[day][time - 7].free = false;
                        temp[day][time - 7].owner = usrid;
                        temp[day][time - 7].bookingHash = bookingHash;
                        numBooked++;
                    } else {

                        out.bookMsg = "Sorry, this room is booked.  Looks like someone beat you to it :(";
                        out.header = "Room Already Booked";
                        resolve(out);
                    }
                } else {
                    temp[day][time - 7].free = false;
                    temp[day][time - 7].owner = usrid;
                    temp[day][time - 7].bookingHash = bookingHash;
                }
            }
            if (usrid === "admin") {
                roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});
                out.success = true;
                var msg = "Booking successful for "; //setting up the message to include multiple times
                for (i in times) {
                    time = times[i];
                    msg += time + ":30 - " + (time + 1) + (i == times.length - 1 ? ":30." : ":30, ");
                }
                out.bookMsg = msg;
                out.header = "Booking Success!";
                resolve(out);
            } else if (userFuncs.updateBookingCount(numBooked, req)) {  // times.length -> if you increment by the number in the array, then if the user books more than once without refreshing, it double counts the hours
                roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});

                out.success = true;
                var msg = "Booking successful for "; //setting up the message to include multiple times
                for (i in times) {
                    time = times[i];
                    if (temp[day][time - 7].bookingHash == bookingHash)
                        msg += time + ":30 - " + (time + 1) + (i == times.length - 1 ? ":30." : ":30, ");
                }
                if (msg.substr(msg.length -1) == ",")
                    msg = msg.substr(0, msg.length - 2);
                out.bookMsg = msg;
                out.header = "Booking Success!";

                if (consts.per_room_limit - totalBooked - numBooked < 0){
                    out.bookMsg = "Sorry, you can only book " + consts.per_room_limit + " hours per day in a single room.  " + msg;
                    out.header = "Max of " + consts.per_room_limit + " hours per room";
                }
                resolve(out);

            } else {
                out = {
                    header: "Booking failed",
                    bookMsg: "Sorry, an error occured and the room was not booked.  Please try again later.",
                    success: false
                };
                resolve(out);

            }
            resolve(out);


        });
    });
}

/**
 *
 * @param day
 * @param time
 * @param roomID
 * @param usrid
 */
function unbookRoom(day, time, length, roomID, usrid, req) {
    return new Promise(function (resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function (data, val) {
            var temp = data.Free;
            var out = {
                header: "Unbooking failed",
                bookMsg: "Sorry, an error occured and the room was not unbooked.  Please try again later.",
                success: false
            };

            var end = length + parseInt(time, 10);
            for (var i = time; i < end; i++) {
                if (temp[day][i - 7].free === false && temp[day][i - 7].owner === usrid) {
                    temp[day][i - 7].free = true;
                    temp[day][i - 7].owner = 0;
                    out.success = true;
                    out.bookMsg = "Unbooking successful for " + data.Name + " at " + time + ":30";
                    out.header = "Unbooking Success!";
                }
                else {
                    out.success = false;
                    out.bookMsg = "Sorry, this room is unbooked.  Looks like someone beat you to it :(";
                    out.header = "Room Already Unbooked"
                    resolve(out);
                }
            }

            if (userFuncs.updateBookingCount(-1, req)) {
                roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});
            }
            resolve(out);

        });
    });
}

function unbookAllForUser(day, roomID, usrid, req) {
    return new Promise(function (resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function (data, val) {
            var temp = data.Free;
            var out = {
                header: "Unbooking failed",
                bookMsg: "Sorry, an error occured and the room was not unbooked.  Please try again later.",
                success: false
            };

            for (var time = 7; time < 23; time++) {
                if (temp[day][time - 7].free === false && temp[day][time - 7].owner === usrid) {
                    temp[day][time - 7].free = true;
                    temp[day][time - 7].owner = 0;
                    out.success = true;
                    out.bookMsg = "Unbooking successful for " + data.Name + " at " + time + ":30";
                    out.header = "Unbooking Success!";
                }
            }

            if (userFuncs.resetBookingCount(req)) {
                roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}});
            }
            resolve(out);

        });
    });
}

function unbookAllForRoom(day, roomID) {
    return new Promise(function (resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function (data, val) {
            var temp = data.Free;
            var out = {
                success: false
            };

            for (var time = 7; time < 23; time++) {
                temp[day][time - 7].free = true;
                temp[day][time - 7].owner = 0;
            }
            out.success = true;

            roomDatabase.update({RoomID: roomID}, {$set: {Free: temp}}, {multi: true});

            resolve(out);

        });
    });
}


function getTotalBookedHoursPerRoom(totalBooked, temp, usrid) {

    for (var i = 7; i < 23; i++) {
        if (temp[i - 7].owner == usrid)
            totalBooked++;
    }
    return totalBooked;

}

module.exports = {
    bookRoom: bookRoom,
    unbookRoom: unbookRoom,
    unbookAllForUser: unbookAllForUser,
    unbookAllForRoom: unbookAllForRoom,
    bookMultiple: bookMultiple
};