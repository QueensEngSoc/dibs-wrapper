var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomDatabase = db.get('roomDatabase');

//All functions return promises, don't know if this is the best way to do this.
//use .then(function(data){}) to get whatever data is needed
/**
 * Ex.
 * getFree(0, 1).then(function(free) {
 *      (use free array)
 * });
 */

/**
 *
 * @param day
 * @param roomID
 * @returns {promise}
 */
function getFree(day, roomID) { //gets the free array of the roomID on the day given
    var out = [];

    var find = new Promise(function (resolve, reject) {
        roomDatabase.find({RoomID: roomID}).each(function (data, i) {
            if (day < data.Free.length)
                out = data.Free[day];
            else
                out = undefined;
            resolve(out);
        });
    });

    return find;
}

/**
 * Returns an object full of rooms free in the next hour with the size of the room appended
 */
function getAllFreeNow() {
    return new Promise(function (resolve) {
        var time = getNextValidHalfHour(false, true);
        var out = {};
        roomDatabase.find({}).each(function (data, i) {
            if (!data.Free[0][time].free)
                return;

            out[data.Name] = {};
            out[data.Name].isSmall = data.size === 0; // allows us to favor picking small rooms
            out[data.Name].id = data.RoomID;
        }).then(function() {
            resolve(out)
        })
    })
}

/**
 *
 * @return {*}: the id of the free room
 */
function getNextFree() {
    return new Promise(function (resolve) {
        var time = getNextValidHalfHour(false, true);
        getListOfRoomState(0, time).then(function (rooms) {
            if (rooms === {})
                return resolve({});

            // try to find a small room first
            for (var i in rooms) {
                if (rooms.hasOwnProperty(i) && rooms[i].free && rooms[i].isSmall === true)
                    return resolve(rooms[i].id) // return available roomID
            }

            // otherwise just return the id of the last element (it really doesn't matter which room it is)
            resolve(rooms[i].id);
        })
    })
}

/**
 *
 * @param roomID
 * @returns {promise}
 */
function getInfo(roomID) { //gets the info of the selected room (roomID)
    var out = {
        room: "Error",
        size: "Error",
        tv: "Error",
        phone: "Error",
        special: "Error",
        tempImgURL: "",
        roomid: roomID,
    };

    var find = new Promise(function (resolve, reject) {
        roomDatabase.findOne({RoomID: roomID}).then(function (data, i) {
            out.room = data.Name;
            out.size = data.Description;
            out.tempImgURL = "/" + data.Picture;
            out.tv = data.tv;
            out.phone = data.phone;
            out.special = data.special;
            out.roomid = roomID;

            resolve(out);
        }).catch(function (data, i) {
            console.log("error: room not found!");
            reject(new Error('No Room Found!'));
        });
    });

    return find;
}

function getInfoByName(roomName) { //gets the info of the selected room (roomID)
    var out = {
        room: "Error",
        size: "Error",
        tv: "Error",
        phone: "Error",
        special: "Error",
        tempImgURL: "",
        roomid: "Error",
    };

    var find = new Promise(function (resolve, reject) {
        roomDatabase.findOne({Name: roomName}).then(function (data, i) {
            out.room = data.Name;
            out.size = data.Description;
            out.tempImgURL = "/" + data.Picture;
            out.tv = data.tv;
            out.phone = data.phone;
            out.special = data.special;
            out.roomid = data.RoomID;
            resolve(out);

        }).catch(function (data, i) {    // the room was not found!
            console.log("error: room not found!");
            reject(new Error('No Room Found!'));
        });
    });

    return find;
}

/** Returns a list of each room, and if the room is currently free or not.  It also returns if the current user is the
 *  person who booked the room if the user is logged in
 *
 * @param day
 * @param time
 * @returns {*}
 */
function getListOfRoomState(day, time, usrid) {
    return new Promise(function (resolve, reject) {
        var listFree = [];
        usrid = typeof usrid !== 'undefined' ? usrid : -1;

        return roomDatabase.find({}).each(function (data, i) {
            var roomNum = data.Name.match(/\d+/)[0]; // get the number from the room
            var mapRoomName = "BMH" + roomNum;
            var listRoomName = "bmh-" + roomNum;

            if (!isValidTime(time)) {
                listFree.push({
                    room: data.Name,
                    roomNum: mapRoomName,
                    roomID: listRoomName,
                    isFree: false,
                    size: data.size,
                    hasTV: data.tv,
                    hasPhone: data.phone
                })
            } else {
                listFree.push({
                    room: data.Name,
                    roomNum: mapRoomName,
                    roomID: listRoomName,
                    size: data.size,
                    hasTV: data.tv,
                    hasPhone: data.phone,
                    isFree: data.Free[day][time - 7].free,
                    isMine: (data.Free[day][time - 7].owner == usrid)  // true if the user booked the room, false otherwise
                })
            }

        }).then(function () {
            return resolve(listFree);

        });
    });
}

/**
 * Gets a list of room bookings for a specific user
 * @param day
 * @param time
 * @param usrid
 * @returns {*}
 */
function getListOfRoomsForUser(usrid) {
    return new Promise(function (resolve, reject) {
        var listBookings = [];
        usrid = typeof usrid !== 'undefined' ? usrid : -1;

        //return roomDatabase.find({"Free": { $elemMatch: {owner: usrid}}}).each(function(data, i) {
        return roomDatabase.find().each(function (data, i) {
            for (var day = 0; day < data.Free.length; day++) {
                for (var i = 0; i < data.Free[day].length; i++) {
                    if (data.Free[day][i].owner === usrid) {
                        var roomNum = data.Name.match(/\d+/)[0]; // get the number from the room
                        var mapRoomName = "bmh" + roomNum;
                        var prettyDay = getPrettyDay(day);
                        listBookings.push({
                            room: data.Name,
                            roomNum: mapRoomName,
                            free: data.Free[day],
                            pic: data.Picture,
                            roomid: data.RoomID,
                            intDay: day,
                            prettyDay: prettyDay,
                            description: data.Description
                        });
                        break;
                    }
                }
            }

        }).then(function () {
            return resolve(listBookings);

        });
    });
}

function getPrettyDay(intDay) {
    if (intDay == 0)
        return "Today";
    else if (intDay == 1)
        return "Tomorrow";
    else if (intDay == -1)
        return "Yesterday";

    var today = new Date();
    today.addDays(intDay);
    return today.toDateString();
}

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function isValidTime(time) {
    var dateObj = new Date();
    var current_min = dateObj.getMinutes();

    if (time < 7 || time > 23 || (time == 23 && current_min > 30) || (time == 7 && current_min < 30))
        return false;
    return true;
}

/**
 * @param formatAsInterval {boolean} whether to format the string as a time interval
 * @param formatAsDBTime {boolean} whether to format the string in the DB format (0-15)
 */
function getNextValidHalfHour(formatAsInterval, formatAsDBTime) {
    var d = new Date();
    var nextHour = d.getHours();
    var nextMin = d.getMinutes();

    if (nextMin > 30)
        nextHour++;

    if (nextHour > 23 || nextHour < 7)
        nextHour = 7;

    if (formatAsInterval)
        return nextHour + ":30-" + (++nextHour) + ":30";
    else if (formatAsDBTime)
        return nextHour - 7;
    else
        return nextHour + ":30";
}

module.exports = {
    getFree: getFree,
    getInfo: getInfo,
    getListOfRoomState: getListOfRoomState,
    getInfoByName: getInfoByName,
    getListOfRoomsForUser: getListOfRoomsForUser,
    getAllFreeNow: getAllFreeNow,
    getNextFree: getNextFree,
    getNextValidHalfHour: getNextValidHalfHour
};