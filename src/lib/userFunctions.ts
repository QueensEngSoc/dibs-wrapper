// Stores the functions used for account based access
import User from "../../models/user";
import { room_hour_limit } from "../../config/config";
import { Room } from '../types/room';
import { object } from 'prop-types';
import { Quicky } from '../types/quick';
const passport = require('passport');

export function getUserID(req): number {
    let usrid = -1;

    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            usrid = user.id;

        } catch (exception) {

        }
    }
    return usrid;
}

export function getAdminStatus(req): boolean {
    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            return user.local.isAdmin;

        } catch (exception) {
            console.error('Crash at "getAdminStatus": ', exception);
        }
    }
    return false;
}


export function canBookMoreRooms(req): boolean {

    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            const bookingCount = user.local.booking_count;
            if (bookingCount >= room_hour_limit)
                return false;
        } catch (exception) {
            console.error('Crash at "canBookMoreRooms": ', exception);
            return false;
        }
    }
    return true;
}

export function getBookingCount(req): number {
    let bookingCount = -1;

    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            bookingCount = user.local.booking_count;
        } catch (exception) {
            console.error('Crash at "getBookingCount": ', exception);
        }
    }
    return bookingCount;
}

export function updateBookingCount(toAdd, req): boolean {
    if (req.isAuthenticated()) {

        try {
            const user = req.user;
            user.local.booking_count += toAdd;
            if (user.local.booking_count > room_hour_limit && !getAdminStatus(req))
                user.local.booking_count = room_hour_limit;  // if something messed up and the user booked more than they should have, set the booked amount to the max
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                if (err)
                    console.error('Error updateBookingCount: ', err);
                console.log("Updated booked rooms count by ", toAdd);
            });
            return true;

        } catch (exception) {
            console.error('crash at updateBookingCount: ', exception);
            return false;
        }
    }
}

export function endOfDayBookingCountReset(toAdd, usrid): boolean {
    try {
        User.findById(usrid, function (err, user) {
            console.log("Found user!");
            user.local.booking_count += toAdd;

            if (user.local.booking_count < 0)   // booking count can't be negative
                user.local.booking_count = 0;
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                console.log("Updated booked hour count by " + toAdd + " -> now " + user.local.booking_count + " of " + room_hour_limit);
                return true;
            });

        });

    } catch (exception) {
        return false;
    }
}

export function resetBookingCount(req): boolean {
    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            user.local.booking_count = 0;
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.booking_count': user.local.booking_count}, function (err, resp) {
                console.log("Updated booked rooms count");
            });
            return true;

        } catch (exception) {
            console.error(exception);
            return false;
        }
    }
}

export function setLastBookedRooms(req, roomid: number, day: number, time: number, length: number, building: number): boolean {
    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            const json = JSON.parse(user.local.lastBookedRooms);
            const booking = ({
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
            console.error(exception);
            return false;
        }
    }
}

export function getLastBookedRooms(req): Room | object {
    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            return JSON.parse(user.local.lastBookedRooms);

        } catch (exception) {
            console.error(exception);
            return ({});
        }
    }
}

export function getQuickyStatus(req): Quicky {
    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            return JSON.parse(user.local.quicky);

        } catch (exception) {
            console.error(exception);
            return null;
        }
    }
}

export function setQuickyStatus(req, quick: Quicky): boolean {
    if (req.isAuthenticated()) {
        try {
            const user = req.user;
            user.local.quicky = JSON.stringify(quick);
            User.findOneAndUpdate({'local.email': user.local.email}, {'local.quicky': user.local.quicky}, function (err, resp) {
                console.log("Updated quicky profile");
            });
            return true;

        } catch (exception) {
            console.error(exception);
            return false;
        }
    }
}
