var monk = require('monk');
var env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
  var db = monk('localhost:27017/roomDatabase');
else
  var db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');

var roomDatabase = db.get('roomDatabase');
import * as userFuncs from "../src/lib/userFunctions";
import * as consts from "../config/config";
var randomstring = require("randomstring"); // used to generate the random hash to see if the room is part of the same booking

//use is same as roomDatabase

/**
 * Used to book different 1 hour time slots for a certain room
 * @param day
 * @param times
 * @param roomID
 * @param usrid
 * @param req
 * @returns {Promise<any>}
 */
export function bookMultiple(day, times, roomID, usrid, req) {
  return new Promise(function (resolve, reject) {

    const isAdmin = userFuncs.getAdminStatus(req);

    if (!isAdmin) {
      if (!userFuncs.canBookMoreRooms(req)) { //Checking if the user has reached their book limit
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

    roomDatabase.find({ RoomID: roomID }).each(function (data, val) {
      var temp = data.Free; //the array of free times for this day
      var roomNum = data.Name.match(/\d+/)[0]; // get the number from the room
      var mapRoomName = "bmh" + roomNum;
      var prettyDay = getPrettyDay(day);

      const isAdmin = userFuncs.getAdminStatus(req);

      var out = { //initialize the output json to send, will be modified based on if the room was successfully booked
        header: "Booking failed",
        bookMsg: "Sorry, an error occured and the room was not booked.  Please try again later.",
        success: false,
        day: day,
        room: data.Name,
        roomNum: mapRoomName,
        free: data.Free[day],
        pic: data.Picture,
        roomid: data.RoomID,
        intDay: day,
        prettyDay: prettyDay,
        description: data.Description
      };

      var bookingHash = randomstring.generate({
        length: 5
      });
      var numBooked = 0;
      var totalBooked = 0;
      var dayData = data.Free[day];
      totalBooked = getTotalBookedHoursPerRoom(totalBooked, dayData, usrid);

      if (consts.per_room_limit - totalBooked <= 0 && !isAdmin) { //check if user has booked too many hours for this room
        out.bookMsg = "Sorry, you can only book " + consts.per_room_limit + " hours per day in a single room";
        out.header = "Max of " + consts.per_room_limit + " hours per room";
        resolve(out);
        return;
      }

      for (var time of times) { //iterate over the array of times given instead of a sequence of numbers
        // if (!isAdmin) { //if a normal user...
        if (temp[day][time - 7].free === true) { //if the room is free at this time
          if (consts.per_room_limit - totalBooked - numBooked <= 0 && !isAdmin) {
            break;
          }
          temp[day][time - 7].free = false; //setup the owner
          temp[day][time - 7].owner = usrid;
          temp[day][time - 7].bookingHash = bookingHash;
          numBooked++;
        } else {

          out.bookMsg = "Sorry, this room is booked.  Looks like someone beat you to it :(";
          out.header = "Room Already Booked";
          resolve(out);
        }
      }
      if (userFuncs.updateBookingCount(numBooked, req)) {  // times.length -> if you increment by the number in the array, then if the user books more than once without refreshing, it double counts the hours
        roomDatabase.update({ RoomID: roomID }, { $set: { Free: temp } });

        //setting up output message
        out.success = true;
        var msg = "Booking successful for "; //setting up the message to include multiple times
        for (const i in times) {
          time = times[i];
          if (temp[day][time - 7].bookingHash == bookingHash)
            msg += time + ":30 - " + (time + 1) + (i == times.length - 1 ? ":30." : ":30, ");
        }
        if (msg.substr(msg.length - 1) == ",")
          msg = msg.substr(0, msg.length - 2);
        out.bookMsg = msg;
        out.header = "Booking Success!";

        if (consts.per_room_limit - totalBooked - numBooked < 0 && !isAdmin) {
          out.bookMsg = "Sorry, you can only book " + consts.per_room_limit + " hours per day in a single room.  " + msg;
          out.header = "Max of " + consts.per_room_limit + " hours per room";
        }
        resolve(out);

      } else { //if everything fails
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
export function unbookRoom(day, time, length, roomID, usrid, req) {
  return new Promise(function (resolve, reject) {
    roomDatabase.find({ RoomID: roomID }).each(function (data, val) {
      var temp = data.Free;
      var out = {
        header: "Unbooking failed",
        bookMsg: "Sorry, an error occured and the room was not unbooked.  Please try again later.",
        success: false
      };
      var numUnbooked = 0;
      var end = length + parseInt(time, 10);
      for (var i = time; i < end; i++) {
        if (temp[day][i - 7].free === false && temp[day][i - 7].owner === usrid) {
          temp[day][i - 7].free = true;
          temp[day][i - 7].owner = 0;
          out.success = true;
          out.bookMsg = "Unbooking successful for " + data.Name + " at " + time + ":30";
          out.header = "Unbooking Success!";
          numUnbooked++;
        } else {
          out.success = false;
          out.bookMsg = "Huh, this room is already unbooked.  Looks like something went wrong on our end :(";
          out.header = "Room Already Unbooked";
          resolve(out);
        }
      }

      if (userFuncs.updateBookingCount(-numUnbooked, req)) {
        roomDatabase.update({ RoomID: roomID }, { $set: { Free: temp } });
      }
      else {

      }
      resolve(out);

    });
  });
}

export function unbookAllForUser(day, roomID, usrid, req) {
  return new Promise(function (resolve, reject) {
    roomDatabase.find({ RoomID: roomID }).each(function (data, val) {
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
        roomDatabase.update({ RoomID: roomID }, { $set: { Free: temp } });
      }
      resolve(out);

    });
  });
}

export function unbookAllForRoom(day, roomID) {
  return new Promise(function (resolve, reject) {
    roomDatabase.find({ RoomID: roomID }).each(function (data, val) {
      var temp = data.Free;
      var out = {
        success: false
      };

      for (var time = 7; time < 23; time++) {
        temp[day][time - 7].free = true;
        temp[day][time - 7].owner = 0;
      }
      out.success = true;

      roomDatabase.update({ RoomID: roomID }, { $set: { Free: temp } }, { multi: true });

      resolve(out);

    });
  });
}

/**
 * This functions gets the total number of hours a user has booked for the given room's free table, per day.
 * This is to allow for limiting them so that other people can use the room, and to prevent monopolizing
 * The number of hours allowed is defined in the consts file.
 * @param totalBooked
 * @param temp
 * @param usrid
 * @returns {totalBooked} (the amount of hours booked by the user for the given room, on that day)
 */
export function getTotalBookedHoursPerRoom(totalBooked, temp, usrid) {

  for (var i = 7; i < 23; i++) {
    if (temp[i - 7].owner == usrid)
      totalBooked++;
  }
  return totalBooked;
}

function getPrettyDay(intDay) {
  if (intDay == 0)
    return "Today";
  else if (intDay == 1)
    return "Tomorrow";
  else if (intDay == -1)
    return "Yesterday";

  var today = new Date();
  today.setTime(today.getTime() + intDay * 24 * 60 * 60 * 1000);
  return today.toDateString();
}


/**
 *
 * @param day
 * @param time
 * @param roomID
 * @param usrid
 * @returns {promise}
 */
//OUT OF DATE, DO NOT USE!!!! USE bookMultiple
export function bookRoom(day, time, roomID, length, usrid, req) { //books a room at a certain time and day and sets the owner to be the usrid
  return new Promise(function (resolve, reject) {

    if (!userFuncs.canBookMoreRooms(req)) {
      var out = {
        header: "Booking failed",
        bookMsg: "Sorry, You have booked too many hours.  There are a max of " + consts.room_hour_limit + " hours allowed.",
        success: false
      };

      resolve(out);
      return;
    }

    roomDatabase.find({ RoomID: roomID }).each(function (data, val) {
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
        } else {
          out.bookMsg = "Sorry, this room is booked.  Looks like someone beat you to it :(";
          out.header = "Room Already Booked"
          resolve(out);
        }
      }
      if (userFuncs.updateBookingCount(1, req)) {
        roomDatabase.update({ RoomID: roomID }, { $set: { Free: temp } });
        out.success = true;
        out.bookMsg = "Booking successful for " + data.Name + " from " + time + ":30 - " + (time + length) + ":30";
        out.header = "Booking Success!";
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
