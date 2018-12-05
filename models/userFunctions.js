// Stores the functions used for account based access
var consts = require('../config/config');
var User = require('../models/user');
var passport = require('passport');

function getUserID(req) {
    var usrid = -1;

    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            usrid = user.id;

        } catch (exception) {

        }
    }
    return usrid;
}

function getAdminStatus(req) {
    var usrid = -1;

    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            return user.local.isAdmin;

        } catch (exception) {
            console.error(exception);
        }
    }
    return usrid;
}


function canBookMoreRooms(req) {

    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            var bookingCount = user.local.booking_count;
            if (bookingCount >= consts.room_hour_limit)
                return false;
        } catch (exception) {
            return false;
        }
    }
    return true;
}

function getBookingCount(req) {
    var bookingCount = -1;

    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            bookingCount = user.local.booking_count;
        } catch (exception) {

        }
    }
    return bookingCount;

}

function updateBookingCount(toAdd, req) {
    if (req.isAuthenticated()) {

        try {
            var user = req.user;
            user.local.booking_count += toAdd;
            if (user.local.booking_count > consts.room_hour_limit)
                user.local.booking_count = consts.room_hour_limit;  // if something messed up and the user booked more than they should have, set the booked amount to the max
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                console.log("Updated booked rooms count");
            });
            return true;

        } catch (exception) {
            return false;
        }
    }
}

function endOfDayBookingCountReset(toAdd, usrid) {
    try {
        User.findById(usrid, function (err, user) {
            console.log("Found user!");
            user.local.booking_count += toAdd;

            if (user.local.booking_count < 0)   // booking count can't be negative
                user.local.booking_count = 0;
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                console.log("Updated booked hour count by " + toAdd + " -> now " + user.local.booking_count + " of " + consts.room_hour_limit);
                return true;
            });

        });

    } catch (exception) {
        return false;
    }
}

function resetBookingCount(req) {
    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            user.local.booking_count = 0;
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                console.log("Updated booked rooms count");
            });
            return true;

        } catch (exception) {
            return false;
        }
    }
}

function setLastBookedRooms(req, roomid, day, time, length, building){
    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            var json = JSON.parse(user.local.lastBookedRooms);
            var booking = ({
               roomid: roomid,
               day: day,
               time: time,
               length: length,
               building: building
            });

            json.push(booking);
            if (json.length > 4)
                json.shift();

            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.json}, function (err, resp) {
                console.log("Updated previously booked rooms for the user");
            });
            return true;

        } catch (exception) {
            return false;
        }
    }
}

function getLastBookedRooms(req){
    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            return JSON.parse(user.local.lastBookedRooms);

        } catch (exception) {
            return ({});
        }
    }
}

function getQuickyStatus(req){
    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            return JSON.parse(user.local.quicky);

        } catch (exception) {
            return ({});
        }
    }
}

function setQuickyStatus(req, quick){
    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            user.local.quicky = JSON.stringify(quick);
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.quicky': user.local.quicky}, function (err, resp) {
                console.log("Updated quicky profile");
            });
            return true;

        } catch (exception) {
            return false;
        }
    }
}


module.exports = {
    getUserID,
    getBookingCount,
    canBookMoreRooms,
    updateBookingCount,
    resetBookingCount,
    endOfDayBookingCountReset,
    setLastBookedRooms,
    getLastBookedRooms,
    getQuickyStatus,
    setQuickyStatus,
    getAdminStatus
};
