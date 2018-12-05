var monk = require('monk');
var env = process.env.NODE_ENV || 'dev';

var db = monk('localhost:27017/adminDatabase');
var adminDB = db.get('adminDatabase');

// addSchedule(createSchedule(new Date(2018, 3, 1), 2, [7], [1]));
// getInRange(1).then(function (data) {
//     console.log(data);
// });

/**
 *
 * @returns {Promise<any>}
 */
function getAll() {
    return new Promise(function(resolve, reject) {
        adminDB.find({}, function(err, data) {
            resolve(data);
        });
    });
}

/**
 *
 * @param schedule
 */
function addSchedule(schedule) {
    return new Promise(function(resolve, reject) {
        var out;
        var errors = [];
        for (room of schedule.roomsAffected) {
            adminDB.find({RoomID: room}, function (err, data) {
                if (err) {
                    console.log(err);
                    errors.push(err);
                }

                var futureRules = data[0].futureRules; //adding rules to current list for room
                futureRules.push(schedule.rules);

                adminDB.update({RoomID: room}, {$set: {futureRules: futureRules}});
            });
        }
        if (errors.length > 0)
            out = {errors: errors};

        resolve(out);
    });
}

/**
 *
 * @param start
 * @param dayLength
 * @param hours
 * @param affectedRooms
 * @returns {{roomsAffected: *, rules: {startDate: *, dayLength: *, hours: *}}}
 */
function createSchedule(start, dayLength, hours, affectedRooms) {
    return {
        roomsAffected: affectedRooms,
        rules: {
            startDate: start,
            dayLength: dayLength,
            hours: hours
        }
    };
}

/**
 *
 * @param room - the room to check by ID
 * @returns {promises}
 */
function getInRange(room) {
    var fortNight = new Date(); //getting the date 2 weeks away
    fortNight.setTime(fortNight.getTime() + 1209600000);

    return new Promise(function (resolve, reject) {
        adminDB.find({RoomID: room}, function (err, data) {
            if (err)
                console.log(err);

            var out = [];

            var rules = data[0].futureRules;
            for (i in rules) {
                var rule = rules[i];
                var daysWithin = getDaysWithinFortnight(rule.startDate); //gets number of days the date is inside the next 2 weeks
                if (daysWithin >= 0) { //if its within the next 2 weeks...
                    var validLength = daysWithin - rule.dayLength + 1;
                    out.push({
                        start: 14 - daysWithin,
                        dayLength: Math.min(rule.dayLength, validLength),
                        hours: rule.hours,
                        roomID: room
                    });
                }
            }

            resolve(out);
        });
    });
}

/** Sets the status of a certain room to be enabled or disabled
 *
 * @param roomID - The integer ID of the room in question
 * @param status - Boolean value, sets the room to be enabled or disabled.
 */
function setStatus(roomID, status) {
    return new Promise(function (resolve, reject) {
        adminDB.find({RoomID: roomID}, function (err, data) {
            if (err) {
                console.log(err);
                resolve(err);
            }

            adminDB.update({RoomID: roomID}, {$set: {enabled: status}});
            resolve(undefined);
        });
    });
}

/** Gets the list of rooms which are currently disabled
 *
 * @returns {Promise<any>}
 */
async function getDisabled() {
    var out = [];
    const data = await getAll();
    for (const room of data) {
        if (room.enabled == false) {
            out.push(room);
        }
    }
    return out;
}

/** Gets the list of room ids which are currently disabled
 *
 * @returns {Promise<Array>}
 */
async function getDisabledRoomIDs() {
    var out = [];
    const data = await getAll();
    for (const room of data) {
        if (room.enabled == false) {
            out.push(room.RoomID);
        }
    }
    return out;
}


/** getDaysWithinFortnight - returns the number of days the given date is within a fortnight
 *
 * @param date - the date to check
 * @returns {number}
 */
function getDaysWithinFortnight(date) {
    var fortnight = new Date();
    fortnight.setTime(fortnight.getTime() + 1209600000);

    var fortnightMS = fortnight.getTime();
    var dateMS = date.getTime();

    return Math.floor((fortnightMS - dateMS) / 86400000);
}


module.exports = {
    addSchedule: addSchedule,
    createSchedule: createSchedule,
    getInRange: getInRange,
    getAll: getAll,
    setStatus: setStatus,
    getDisabled,
    getDisabledRoomIDs
};
