var monk = require('monk');
var db = monk('localhost:27017/adminDatabase');
var adminDB = db.get('adminDatabase');

// addSchedule(createSchedule(new Date(2018, 2, 1), 2, [1]));

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
    for (room of schedule.roomsAffected) {
        adminDB.find({RoomID: room}, function (err, data) {
            if (err)
                console.log(err);

            var futureRules = data[0].futureRules; //adding rules to current list for room
            futureRules.push(schedule.rules);

            adminDB.update({RoomID: room}, {$set: {futureRules: futureRules}});
        });
    }
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

    return new promise(function (resolve, reject) {
        adminDB.find({RoomID: room}, function (err, data) {
            if (err)
                console.log(err);

            var out = [];

            var rules = data[0].futureRules;
            for (i in rules) {
                var rule = rules[i];
                var daysWithin = getDaysWithinFortnight(rule.start); //gets number of days the date is inside the next 2 weeks
                if (daysWithin >= 0) { //if its within the next 2 weeks...
                    var validLength = daysWithin - rule.dayLength;
                    out.push({
                        start: 14 - daysWithin,
                        dayLength: validLength,
                        hours: rule.hours
                    });
                }
            }

            resolve(out);
        });
    });
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
    getAll: getAll
};