// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../src/lib/userFunctions');
var roomBook = require('../models/roomBooking');
var consts = require('../config/config');
var email = require('../models/sendEmail');
var prefGetter = require('../models/preferences');
var shiftingFuncs = require('../models/dbFunctions');

router.post('/testDayShift', function (req, res) {
  console.log("Shifting Starting...")
  shiftingFuncs.endOfDayShift();
});

router.post('/accounts/unbook', function (req, res) {
  var roomToBook = JSON.stringify(req.body);
  var obj = JSON.parse(roomToBook);
  var bookingTimeStart = parseInt(obj.time);

  var roomid = parseInt(obj.roomID, 10);
  var usrid = accountFuncs.getUserID(req);
  var length = parseInt(obj.length, 10);
  var day = parseInt(obj.day, 10);

  if (usrid !== -1) {
    if (roomid >= 0) {
      roomBook.unbookRoom(day, bookingTimeStart, length, roomid, usrid, req).then(function (data) { // day, time, length, roomID, usrid
        console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomid + " Success" + data.success);
        var left = consts.room_hour_limit - req.user.local.booking_count;
        res.send({
          HeaderMsg: data.header,
          BookingStatusMsg: data.bookMsg,
          BookStatus: data.success,
          HoursNow: left,
          maxHours: consts.room_hour_limit
        });
      });
    } else {
      var date = new Date();
      var current_hour = date.getHours();

      var unbookAll = new Promise(function (resolve, reject) {
        roomFuncs.getListOfRoomsForUser(usrid).then(function (rooms) {
          for (var room of rooms) {
            roomBook.unbookAllForUser(room.intDay, room.roomid, usrid, req).then(function (success) {
            });
          }
          if (rooms.length == 0)  // something went wrong, so let's reset the booking count to 0, since the user has no rooms booked at the moment
            accountFuncs.resetBookingCount(req);

          resolve("Successful unbooking!");
        });
      });

      unbookAll.then(function (data) {
        res.send({
          HeaderMsg: 'Unbooking Success!',
          BookingStatusMsg: 'Unbooking successful for all reservations',
          BookStatus: true,
          unbookedAll: true
        });
      });
    }
  }
});

router.get('/account/verify', function (req, res, next) {

  if (req.isAuthenticated())
    return res.redirect('/accounts');

  if (req.query.verificationCode != undefined && req.query.verificationCode != "") {
    var code = req.query.verificationCode;
    if (code == user.local.verify_token) {
      User.findOneAndUpdate({ 'local.email': email }, { 'local.verified': true }, function (err, resp) {
        console.log('The user has been verified!');
      });

      res.render('/accounts');
    }
  } else {
    req.flash('loginMessage', 'Verification code incorrect!  A email was resent to your inbox, please try again');
    res.render('login');
  }


});

router.post('/accounts/sendverification', function (req, res, next) {
  var usrid = accountFuncs.getUserID(req);
  if (usrid == -1 || usrid == undefined)
    return res.redirect('/login');
  else {
    if (!req.user.local.verified) {
      email.sendVerificationMail(req.user.local.email, consts.fromEmail, req.user.local.verify_token, req);
    }
  }
});

router.get('/accounts', function (req, res, next) {
  var usrid = accountFuncs.getUserID(req);

  var msg = req.flash('bookingMessage')
  var newSignupMsg = req.flash('signupMessage');
  if (newSignupMsg != undefined && newSignupMsg.length > 0) {
    if (newSignupMsg.indexOf('signup_successful!') >= 0) {
      return res.redirect('/welcome');
    }
  }

  const isAdmin = accountFuncs.getAdminStatus(req);
  // var bookingLimit = consts.room_booking_limit;    // by room bookings
  var bookingLimit = isAdmin ? 'unlimited' : consts.room_hour_limit;          // by hour bookings

  if (usrid == -1 || usrid == undefined)
    return res.redirect('/login');
  else {
    if (!req.user.local.verified) {
      req.logout();
      return res.redirect('/login');
    }

    var json = "";

    if (msg != undefined && msg.length > 0) {   // roomID + "-" + bookingTimeStart + "-" + length + "-" + day is the order of data
      var msgTxt = msg[0];
      var data = JSON.parse(msgTxt);
      var times = data['times[]'];
      var timeArr = JSON.parse("[" + times + "]");    // have to do this to make the JSON object an array of ints, instead of strings (which crashes :/)
      var day = parseInt(data.day, 10);

      roomBook.bookMultiple(day, timeArr, parseInt(data.roomID, 10), usrid, req).then(function (data) {
        console.log("Data! " + data);
        json = JSON.stringify(data);
        roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

          var free = listBookings;
          if (free != undefined) {
            if (data.header == "Booking Success!") {
              if (listBookings.length == 0) { // generate a free table for the day the room was booked, since we have a blank var here
                listBookings = data;
              }

              // set the appropriate variables so that the booking shows up on the admin page properly
              var day = parseInt(data.day, 10);
              var flag = false;

              for (var dayData of listBookings) {
                if (dayData.intDay == day && data.roomNum == dayData.roomNum) {  // the day is the same as the one we just booked, so add that one into the system
                  for (var time of timeArr) {
                    free[day].free[time - 7].free = false;
                    free[day].free[time - 7].owner = req.user.id;
                  }
                  flag = true;
                }
              }

              if (flag == false) {
                listBookings.push(data);
              }
            }

            for (var day = 0; day < listBookings.length; day++) {
              var length = 1;
              var end = 16;
              for (var i = 0; i < end; i++) {
                if (free[day].free[i].owner == req.user.id) {
                  var length = 0;
                  var index = i + 1;
                  while (index < end && free[day].free[index++].owner == req.user.id) {
                    length++;
                  }
                  if (i + 1 < end)
                    free[day].free.splice(i + 1, length);
                  end -= length;
                  var time = free[day].free[i].time;
                  free[day].free[i].time = updateTime(time, length);
                  free[day].free[i].length = length + 1;
                }
              }
            }
          }

          const bookingsLeftMessage = isAdmin ? `${req.user.local.booking_count} of unlimited` : `${bookingLimit - req.user.local.booking_count} of ${bookingLimit}`;
          const bookingsHeader = isAdmin ? 'Hours booked' : 'Hours Left';
          console.log(bookingsHeader, bookingsLeftMessage, '*************')
          res.render('accountPage', {    // render the page with server side variables passed to the client
            user: req.user,
            isLoggedIn: true,
            booking: listBookings,
            json: json,
            bookingLimit: bookingLimit,
            bookingsHeader,
            bookingsLeftMessage,
            hasJson: true,
            theme: req.theme === "custom" ? false : req.theme,
            useTheme: req.theme === "custom" ? false : true,
            colors: req.colors
          });

        });

      });
    } else {
      roomFuncs.getListOfRoomsForUser(usrid).then(function (listBookings) {

        var free = listBookings;
        if (free != undefined) {
          for (var day = 0; day < listBookings.length; day++) {
            var length = 1;
            var end = 16;
            for (var i = 0; i < end; i++) {
              if (free[day].free[i].owner == req.user.id) {
                var length = 0;
                var index = i + 1;
                while (index < end && free[day].free[index++].owner == req.user.id) {
                  length++;
                }
                if (i + 1 < end)
                  free[day].free.splice(i + 1, length);
                end -= length;
                var time = free[day].free[i].time;
                free[day].free[i].time = updateTime(time, length);
                free[day].free[i].length = length + 1;
              }
            }
          }
        }

        const bookingsLeftMessage = isAdmin ? `${req.user.local.booking_count} of unlimited` : `${bookingLimit - req.user.local.booking_count} of ${bookingLimit}`;
        const bookingsHeader = isAdmin ? 'Hours booked' : 'Hours Left';
        console.log(bookingsHeader, bookingsLeftMessage, '*************')

        res.render('accountPage', {    // render the page with server side variables passed to the client
          user: req.user,
          isLoggedIn: true,
          booking: listBookings,
          json: json,
          bookingLimit: bookingLimit,
          bookingsHeader,
          bookingsLeftMessage,
          hasJson: false,
          useTheme: req.theme === "custom" ? false : true,
          theme: req.theme,
          colors: req.colors
        });

      });
    }
  }

});

function updateTime(time, length) {
  var pos = getPosition(time, '-', 1);        // get the position of the second - in the string
  var tempStr = time.substr(pos + 2);         // get the substring of the pos + 2 (the start of the ending hour)
  var colnPos = getPosition(tempStr, ':', 1); // get the pos of the colon (to determine if the time is 1 or 2 digits long
  var endStr = tempStr;                       // save this ending string, we need it for later
  tempStr = tempStr.substr(0, colnPos);       // cut the substring to the colon posistion, leaving the time
  var timeInt = parseInt(tempStr, 10);        // turn the time to an int
  timeInt += length;                                  // add one
  time = time.substr(0, pos + 2) + timeInt + endStr.substr(colnPos);  // add everything back into a single string
  return time;
}

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

export default router;
