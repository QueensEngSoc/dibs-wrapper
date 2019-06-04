var monk = require('monk');
var env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
  var db = monk('localhost:27017/roomDatabase');
else
  var db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');
var roomDatabase = db.get('roomDatabase');
const adminFuncs = require('./adminDatabase');

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
 * @returns {array}
 */

function createNewFreeTable(length, isFree) {
  const newFreeTable = new Array(length);
  for (var i = 0; i < length; i++) {
    newFreeTable[i] = {
      free: isFree,
      time: ((7 + i) >= 10 ? (7 + i) : "0" + (7 + i)) + ":30 - " + ((8 + i) >= 10 ? (8 + i) : "0" + (8 + i)) + ":30",
      startTime: 7 + i,
      owner: 0,
    };
  }
  return newFreeTable;
}

export async function getFree(day, roomID) { //gets the free array of the roomID on the day given
  const disabledRooms = await adminFuncs.getDisabledRoomIDs();
  const rooms = await roomDatabase.find({ RoomID: roomID });

  if (rooms.length <= 0)
    return undefined;

  if (disabledRooms.includes(roomID)) {
    if (day < rooms[0].Free.length) {
      return createNewFreeTable(rooms[0].Free[day].length, false)
    }
  }

  if (day < rooms[0].Free.length)
    return rooms[0].Free[day];
  else
    return undefined;
}

/**
 * Returns an object full of rooms free in the next hour with the size of the room appended
 */
export function getAllFreeNow() {
  return new Promise(function (resolve) {
    var time = getNextValidHalfHour(false, true);
    var out = {};
    roomDatabase.find({}).each(function (data, i) {
      if (!data.Free[0][time].free)
        return;

      out[data.Name] = {};
      out[data.Name].isSmall = data.size === 0; // allows us to favor picking small rooms
      out[data.Name].id = data.RoomID;
    }).then(function () {
      resolve(out)
    })
  })
}

/**
 *
 * @return {*}: the id of the free room
 */
export async function getNextFree() {
  var time = getNextValidHalfHour(false, true);
  console.log('calling get list of Room state with: ', time);
  const rooms = await getListOfRoomState(0, time);
  if (rooms === {})
    return {};

  // try to find a small room first
  for (var i of rooms) {
    if (i.isFree && i.size == 0)
      return i.id; // return available roomID
  }

  // otherwise just return the id of the last element (it really doesn't matter which room it is)
  rooms[i].id;

}

/**
 *
 * @param roomID
 * @returns {promise}
 */
export function getInfo(roomID) { //gets the info of the selected room (roomID)
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
    roomDatabase.findOne({ RoomID: roomID }).then(function (data, i) {
      out.room = data.Name;
      out.size = data.Description;
      out.tempImgURL = "/" + data.Picture;
      out.tv = data.tv;
      out.phone = data.phone;
      out.special = data.special;
      out.roomid = roomID;

      resolve(out);
    }).catch(function (data, i) {
      console.log("error: room id " + roomID + " not found!");
      reject(new Error('No Room Found with ID ' + roomID));
    });
  });

  return find;
}

export function getInfoByName(roomName) { //gets the info of the selected room (roomID)
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
    roomDatabase.findOne({ Name: roomName }).then(function (data, i) {
      out.room = data.Name;
      out.size = data.Description;
      out.tempImgURL = "/" + data.Picture;
      out.tv = data.tv;
      out.phone = data.phone;
      out.special = data.special;
      out.roomid = data.RoomID;
      resolve(out);

    }).catch(function (data, i) {    // the room was not found!
      console.log("error: room " + roomName + " not found!");
      reject(new Error('No Room Found called ' + roomName));
    });
  });

  return find;
}

/** Returns a list of each room, and if the room is currently free or not.  It also returns if the current user is the
 *  person who booked the room if the user is logged in
 *  Set time as -1 to get the list for the entire selected day
 * @param day
 * @param time
 * @returns {*}
 */
export async function getListOfRoomState(day, time, usrid) {
  var listFree = [];
  usrid = typeof usrid !== 'undefined' ? usrid : -1;

  const data = await roomDatabase.find({});
  const disabledRooms = await adminFuncs.getDisabledRoomIDs();

  for (const roomData of data) {
    var roomNum = roomData.Name.match(/\d+/)[0]; // get the number from the room
    var mapRoomName = "BMH" + roomNum;
    var listRoomName = "bmh-" + roomNum;
    const isNotValidTime = time !== -1 ? !isValidTime(time) : false;

    if (isNotValidTime || disabledRooms.includes(roomData.RoomID)) {
      listFree.push({
        room: roomData.Name,
        roomNum: mapRoomName,
        roomID: listRoomName,
        isFree: generateFreeTable(16, false),
        size: roomData.size,
        hasTV: roomData.tv,
        hasPhone: roomData.phone,
        id: roomData.RoomID
      });
    } else if (time == -1) {
      listFree.push({
        room: roomData.Name,
        roomNum: mapRoomName,
        roomID: listRoomName,
        size: roomData.size,
        hasTV: roomData.tv,
        hasPhone: roomData.phone,
        isFree: roomData.Free[day],
        id: roomData.RoomID
      });
    } else {
      if (roomData.Free[day][time - 7] == undefined) {
        console.error("Error: something really bad happened!");
        console.error("Value of roomData.Free table for day " + day + ": (broke accessing time " + time + ")");
        console.error(roomData.Free[day]);

      } else {  // error should be caught above, and this should no longer error out.  ToDo: Make this a proper try/catch logic block later
        listFree.push({
          room: roomData.Name,
          roomNum: mapRoomName,
          roomID: listRoomName,
          size: roomData.size,
          hasTV: roomData.tv,
          hasPhone: roomData.phone,
          id: roomData.RoomID,
          isFree: roomData.Free[day][time - 7].free,
          isMine: (roomData.Free[day][time - 7].owner == usrid)  // true if the user booked the room, false otherwise
        });
      }
    }
  }

  return listFree;
}

/**
 * Gets a list of room bookings for a specific user
 * @param day
 * @param time
 * @param usrid
 * @returns {*}
 */
export function getListOfRoomsForUser(usrid) {
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
  today.setTime(today.getTime() + intDay * 24 * 60 * 60 * 1000);
  return today.toDateString();
}

function isValidTime(time, day) {
  var dateObj = new Date();
  var current_min = dateObj.getMinutes();
  var current_hour = dateObj.getHours();
  if (time < 7 || time > 23 || (time == 23 && current_min > 30) || (time == 7 && current_min < 30))
    return false;
  return true;
}

/**
 * @param formatAsInterval {boolean} whether to format the string as a time interval
 * @param formatAsDBTime {boolean} whether to format the string in the DB format (0-15)
 */
export function getNextValidHalfHour(formatAsInterval, formatAsDBTime) {
  var d = new Date();
  var nextHour = d.getHours();
  var nextMin = d.getMinutes();

  if (nextMin > 30)
    nextHour++;

  if (nextHour > 23 || nextHour < 7)
    nextHour = 7;

  console.log('next valid half hour ', nextHour);

  if (formatAsInterval)
    return nextHour + ":30-" + (++nextHour) + ":30";
  else if (formatAsDBTime)
    return nextHour;    // booking function already subtracts 7, so this had the effect of doing -14, or 7 hours before you actually wanted the room :(
  else
    return nextHour + ":30";
}

export function getValidDate(date) {
  var today = new Date();
  var max = addDays(today, 14);

  var day = date - today;
  day = Math.ceil(day / (1000 * 3600 * 24));
  if (day > 0 && day < 14)
    return true;
  else
    return false;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generates a new free table array, without adding it to the database.  This is (for now) only used in the admin page
 * to fix the issue with just booked rooms not showinf up on the admin page
 * @param days
 * @param len
 * @returns free table array object with the number of days specified by days, and a day length of len
 */
export function generateFreeTable(days, len) {
  var out = new Array(days);
  for (var j = 0; j < days; j++) {
    var curDay = new Array(len);
    for (var i = 0; i < len; i++) {
      curDay[i] = {
        free: false,
        time: ((7 + i) >= 10 ? (7 + i) : "0" + (7 + i)) + ":30 - " + ((8 + i) >= 10 ? (8 + i) : "0" + (8 + i)) + ":30",
        startTime: 7 + i,
        owner: 0,
        bookingHash: ""
      };
    }
    out[j] = curDay;
  }
  return out;
}
