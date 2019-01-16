import monk from 'monk';

const env = process.env.NODE_ENV || 'dev';

let db;
if (env == 'dev') {
  db = monk('localhost:27017/roomDatabase');
} else {
  db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');
}

const roomDatabase = db.get('roomDatabase');
import * as userFuncs from '../../models/userFunctions';
import * as consts from '../../config/config';

import randomstring from 'randomstring'; // used to generate the random hash to see if the room is part of the same booking

function getPrettyDay(intDay) {
  if (intDay == 0)
    return 'Today';
  else if (intDay == 1)
    return 'Tomorrow';
  else if (intDay == -1)
    return 'Yesterday';

  var today = new Date();
  today.setTime(today.getTime() + intDay * 24 * 60 * 60 * 1000);
  return today.toDateString();
}

export function getTotalBookedHoursPerRoom(totalBooked, temp, usrid) {

  for (var i = 7; i < 23; i++) {
    if (temp[i - 7].owner == usrid)
      totalBooked++;
  }
  return totalBooked;
}


export function bookMultiple(day: number, times: Array<number>, roomID: number, usrid, req) {
  return new Promise(function (resolve, reject) {
    const isAdmin = userFuncs.getAdminStatus(req);

    if (!isAdmin) {
      if (!userFuncs.canBookMoreRooms(req)) { //Checking if the user has reached their book limit
        return {
          header: 'Booking failed',
          bookMsg: 'Sorry, You have booked too many hours.  There are a max of ' + consts.room_hour_limit + ' hours allowed.',
          success: false,
          day: day
        };
      }
    }

    roomDatabase.find({ RoomID: roomID }).each(function (data, val) {
      let time;
      const temp = data.Free; //the array of free times for this day
      const roomNum = data.Name.match(/\d+/)[0]; // get the number from the room
      const mapRoomName = 'bmh' + roomNum;
      const prettyDay = getPrettyDay(day);

      const isAdmin = userFuncs.getAdminStatus(req);

      const out = { //initialize the output json to send, will be modified based on if the room was successfully booked
        header: 'Booking failed',
        bookMsg: 'Sorry, an error occured and the room was not booked.  Please try again later.',
        success: false,
        day: day,
        room: data.Name,
        roomNum: mapRoomName,
        free: data.Free[day],
        pic: data.Picture,
        roomid: data.RoomID,
        intDay: day,
        prettyDay: prettyDay,
        description: data.Description,
        times: []
      };

      const bookingHash = randomstring.generate({
        length: 5
      });
      var numBooked = 0;
      var totalBooked = 0;
      const dayData = data.Free[day];
      totalBooked = getTotalBookedHoursPerRoom(totalBooked, dayData, usrid);

      if (consts.per_room_limit - totalBooked <= 0 && !isAdmin) { //check if user has booked too many hours for this room
        out.bookMsg = 'Sorry, you can only book ' + consts.per_room_limit + ' hours per day in a single room';
        out.header = 'Max of ' + consts.per_room_limit + ' hours per room';
        resolve(out);
      }

      for (const hour of times) { //iterate over the array of times given instead of a sequence of numbers
        console.log('time: ', hour);
        if (temp[day][hour - 7].free === true) { //if the room is free at this time
          if ((consts.per_room_limit - totalBooked - numBooked <= 0) && !isAdmin) {
            break;
          }
          temp[day][hour - 7].free = false; //setup the owner
          temp[day][hour - 7].owner = usrid;
          temp[day][hour - 7].bookingHash = bookingHash;
          numBooked++;
        } else {

          out.bookMsg = 'Sorry, this room is booked.  Looks like someone beat you to it :(';
          out.header = 'Room Already Booked';
          resolve(out);
        }
      }
      if (userFuncs.updateBookingCount(numBooked, req)) {  // times.length -> if you increment by the number in the array, then if the user books more than once without refreshing, it double counts the hours
        roomDatabase.update({ RoomID: roomID }, { $set: { Free: temp } });

        //setting up output message
        out.success = true;
        var msg = 'Booking successful for '; //setting up the message to include multiple times
        for (const i in times) {
          time = times[i];

          if (temp[day][time - 7].bookingHash == bookingHash) {
            // @ts-ignore
            const timeStr = `${time}:30 - ${time + 1}${i == times.length - 1 ? ':30.' : ':30, '}`;
            msg += timeStr;
            out.times.push(timeStr);
          }
        }

        if (msg.substr(msg.length - 1) == ',')
          msg = msg.substr(0, msg.length - 2);
        out.bookMsg = msg;
        out.header = 'Booking Success!';
        out.times = times;

        if ((consts.per_room_limit - totalBooked - numBooked < 0) && !isAdmin) {
          out.bookMsg = 'Sorry, you can only book ' + consts.per_room_limit + ' hours per day in a single room.  ' + msg;
          out.header = 'Max of ' + consts.per_room_limit + ' hours per room';
        }
        resolve(out);

      } else { //if everything fails
        return {
          header: 'Booking failed',
          bookMsg: 'Sorry, an error occured and the room was not booked.  Please try again later.',
          success: false
        };
      }
      resolve(out);
    });
  });

}
