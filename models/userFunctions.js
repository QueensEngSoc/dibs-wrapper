// Stores the functions used for account based access
var consts = require('../config/config');
var User = require('../models/user');
var ObjectId = require('mongodb').ObjectId;
var monk = require('monk');
var db = monk('localhost:27017/usrAccountsDatabase');

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

function canBookMoreRooms(req) {

    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            var bookingCount = user.local.booking_count;
            if (bookingCount >= consts.room_booking_limit)
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
            var usrID = new ObjectId(usrid);

            var ObjectId = new User.ObjectId(usrid);
            db.users.findOne({ _id: ObjectId }, function (err, info) {
                console.log(info)
            });

            User.findOne({"_id" : usrID}, function (err, user) {
                user.local.booking_count += toAdd;
                User.findOneAndUpdate({'_id': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                    console.log("Updated booked rooms count");
                });
                return true;

            });
        }catch (exception) {
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

module.exports = {
    getUserID: getUserID,
    getBookingCount: getBookingCount,
    canBookMoreRooms: canBookMoreRooms,
    updateBookingCount: updateBookingCount,
    resetBookingCount: resetBookingCount,
    endOfDayBookingCountReset: endOfDayBookingCountReset
};