var monk = require('monk');
var env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
  var db = monk('localhost:27017/adminDatabase');
else
  var db = monk('mongodb://heroku_hh23n177:mkhup337tbpb35q85m5c066jla@ds035607.mlab.com:35607/heroku_hh23n177');

var adminDB = db.get('adminDatabase');

// addSchedule(createSchedule(new Date(2018, 3, 1), 2, [7], [1]));
// getInRange(1).then(function (data) {
//     console.log(data);
// });

/**
 *
 * @returns {Promise<any>}
 */
export function getAll() {
  return new Promise(function (resolve, reject) {
    adminDB.find({}, function (err, data) {
      resolve(data);
    });
  });
}

/**
 *
 * @param schedule
 */
export function addSchedule(schedule) {
  return new Promise(function (resolve, reject) {
    var out;
    var errors = [];
    for (room of schedule.roomsAffected) {
      adminDB.find({ RoomID: room }, function (err, data) {
        if (err) {
          console.log(err);
          errors.push(err);
        }

        var futureRules = data[0].futureRules; //adding rules to current list for room
        futureRules.push(schedule.rules);

        adminDB.update({ RoomID: room }, { $set: { futureRules: futureRules } });
      });
    }
    if (errors.length > 0)
      out = { errors: errors };

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
export function createSchedule(start, dayLength, hours, affectedRooms) {
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
export function getInRange(room) {
  var fortNight = new Date(); //getting the date 2 weeks away
  fortNight.setTime(fortNight.getTime() + 1209600000);

  return new Promise(function (resolve, reject) {
    adminDB.find({ RoomID: room }, function (err, data) {
      if (err)
        console.log(err);

      var out = [];

      var rules = data[0].futureRules;
      for (const i in rules) {
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
export function setStatus(roomID, status) {
  return new Promise(function (resolve, reject) {
    adminDB.find({ RoomID: roomID }, function (err, data) {
      if (err) {
        console.log(err);
        resolve(err);
      }

      adminDB.update({ RoomID: roomID }, { $set: { enabled: status } });
      resolve(undefined);
    });
  });
}

/** Gets the list of rooms which are currently disabled
 *
 * @returns {Promise<any>}
 */
export async function getDisabled() {
  const data = await getAll();
  data && data.length && data.filter((room) => !room.enabled) || [];
}

/** Gets the list of room ids which are currently disabled
 *
 * @returns {Promise<Array>}
 */
export async function getDisabledRoomIDs() {
  const disabledRooms = await getDisabled();
  return disabledRooms.map((room) => room.roomID);
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

//
// export = {
//     addSchedule: addSchedule,
//     createSchedule: createSchedule,
//     getInRange: getInRange,
//     getAll: getAll,
//     setStatus: setStatus,
//     getDisabled,
//     getDisabledRoomIDs
// };
