var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
var roomDatabase = db.get('roomDatabase');
var schedule = require('node-schedule');
var accountFuncs = require('./userFunctions');

function endOfDayShift(){
    return new Promise(function(resolve, reject) {

        return roomDatabase.find({}).each(function(data, i) {
            var free = data.Free;
            var dayToRemove = free[0];
            var hash = "";
            for (var i = 0; i < 16; i++){
                // if (dayToRemove)
                var hour = dayToRemove[i];
                if (hour.owner != 0){
                    if (hash == "" || hash != hour.bookingHash) {
                        hash = hour.bookingHash;
                        accountFuncs.endOfDayBookingCountReset(-1,hour.owner);
                    }
                }
            }
            free.shift();
            var newDay = createNewDayArray(16, true);
            free.push(newDay);
            var roomID = data.RoomID;
            roomDatabase.update({RoomID: roomID}, {$set: {Free: free}});

        }).then(function () {
            return resolve();

        });
    });

}

function setupEndOfDayScript(){
    console.log("Setting up day shifting code...");

    schedule.scheduleJob({hour: 0, minute: 40}, function() {
        console.log("Shifting day now...")
        endOfDayShift();
    }); // run everyday at midnight

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

endOfDayShift();

module.exports = {
    endOfDayShift: endOfDayShift,
    setupEndOfDayScript: setupEndOfDayScript
};