var monk = require('monk');
var env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
  var db = monk('localhost:27017/roomDatabase');
else
  var db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');

var roomDatabase = db.get('roomDatabase');
var schedule = require('node-schedule');
var accountFuncs = require('../src/lib/userFunctions');
var adminFuncs = require('./adminDatabase');
var roomBook = require('./roomBooking');

export function endOfDayShift() {
  return new Promise(function (resolve, reject) {

    return roomDatabase.find({}).each(function (data, i) {
      var free = data.Free;
      var dayToRemove = free[0];
      var hash = "";
      var numToRemove = [];

      for (var i = 0; i < 16; i++) {
        // if (dayToRemove)
        var hour = dayToRemove[i];
        if (hour.owner != 0) {
          // if (hash == "" || hash != hour.bookingHash) {
          hash = hour.bookingHash;
          // accountFuncs.endOfDayBookingCountReset(-1,hour.owner);   // this no worky, causes a critical section that may break if you are unlucky :(
          numToRemove.push({
            userid: hour.owner
          });
          // }
        }
      }
      // this section gets all unique ids that booked a room for the previous day, then goes through the array to add one
      // to the count, and finally it calls the reset booking amount function to give the user the correct amount of room booking slots back
      var unique = [...new Set(numToRemove.map(item => item.userid))];    // this ugly mess is needed, as critical sections are a thing :(
      for (var i = 0; i < unique.length; i++) {
        var count = 0;
        for (var j = 0; j < numToRemove.length; ++j) {
          if (numToRemove[j].userid == unique[i])
            count++;
        }
        accountFuncs.endOfDayBookingCountReset(-count, unique[i]);
      }

      free.shift();
      var newDay = createNewDayArray(16, true);
      free.push(newDay);
      var roomID = data.RoomID;
      roomDatabase.update({ RoomID: roomID }, { $set: { Free: free } });

    }).then(function () {
      return resolve();

    });
  });

}

function checkAdminDB() {
  adminFuncs.getAll().then(function (rooms) {
    for (var room of rooms) {
      adminFuncs.getInRange(room.RoomID).then(function (ranges, err) {
        for (var range of ranges) {
          roomBook.bookMultiple(range.start, range.hours, range.roomID, "admin", undefined).then(function (data) {
            console.log("A schedule is in range, booking rooms...");
            console.log(data);
          });
        }
      });
    }
  });
}

export function setupEndOfDayScript() {
  console.log("Setting up day shifting code...");

  schedule.scheduleJob({ hour: 0, minute: 0 }, function () {
    console.log("Shifting day now...")
    endOfDayShift();
    console.log("Checking admin database...")
    checkAdminDB();
  }); // runs everyday at midnight

  console.log("Done setup!  Free table should automagically™ remove the previous day, and add a new day at midnight");

}

function createNewDayArray(len, val) {
  var out = new Array(len);
  for (var i = 0; i < len; i++) {
    out[i] = {
      free: val,
      time: ((7 + i) >= 10 ? (7 + i) : "0" + (7 + i)) + ":30 - " + ((8 + i) >= 10 ? (8 + i) : "0" + (8 + i)) + ":30",
      startTime: 7 + i,
      owner: 0,
      bookingHash: ""
    };
  }
  return out;
}

// endOfDayShift(); // uncomment out this line to cause the day shifting to run when app.js starts, irrespective of what time it is
