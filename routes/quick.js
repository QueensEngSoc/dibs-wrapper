var express = require('express');
var router = express.Router();
var roomBook = require('../models/roomBooking');
var roomDB = require('../models/roomDatabase');
var accountFuncs = require('../models/userFunctions');


router.get('/quicky', function (req, res, next) { //the request to render the page
  if (!req.isAuthenticated())
    return res.redirect('/accounts');

  res.render('quick', {
    theme: req.theme === "custom" ? false : req.theme,
    colors: req.colors
  });
});

router.post('/quicky', async function (req, res, next) {
  if (!req.isAuthenticated())
    return res.redirect('/login?redirect=/quicky'); // do the redirecting thing TODO: Alex?

  var usrid = accountFuncs.getUserID(req);
  var bookDay = 0;

  // var time = figureOutNextValidTime(usrid);
  const out = await roomDB.getNextFree();
  if (out === {})
    return res.send("No free rooms!");
  var date = new Date();
  var quick = accountFuncs.getQuickyStatus(req);
  var time = roomDB.getNextValidHalfHour(false, true);

  if (date.toDateString() == quick.date && quick.number > 0) {
    time += quick.number;
    if (time >= 23) {
      time = time % 23 + 7;
      bookDay++;
    }
  }

  roomBook.bookRoom(bookDay, time, out, 1, usrid, req).then(function (data) {
    console.log(data.bookMsg);
    if (data.header.indexOf('Booking Success!') >= 0) {
      quick.number++;
      if (isNaN(quick.number))
        quick.number = 1;
      quick.date = date.toDateString();
      accountFuncs.setQuickyStatus(req, quick);
      if (bookDay > 0)
        data.bookMsg += " tomorrow";
    }
    res.send({ HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success });
  }).catch(function (err) {
    console.log(err);
    res.send("An error occurred while rushing to Automagically™ QuickBook™ your room.")
  });
});

// function figureOutNextValidTime(usrid){
//     roomDB.getListOfRoomsForUser(usrid).then(function (listBookings) {
//         for(var booking in listBookings){
//         }
//     });
// }
module.exports = router;
