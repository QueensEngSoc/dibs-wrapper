var express = require('express');
var router = express.Router();
var adminFuncs = require('../models/adminDatabase');
var userFuncs = require('../src/lib/userFunctions');

router.get('/admin', function(req, res) {
    if (req.isAuthenticated() && userFuncs.getAdminStatus(req)) {
      adminFuncs.getAll().then(function (data) {
        res.render('admin', { list: data, isLoggedIn: true});
      });
    } else {
      res.render("404", {
        message: "<p>You seem to have wandered off the beaten path!</p>" +
          "<p><a href='/'>Go back to the homepage</a> or <a href='/quicky'>QuickBook a room</a>!</p>",
        image: "trail.jpg",
        theme: req.theme === "custom" ? false : req.theme,
        colors: req.colors
      });
    }
});

// router.get('/schedulecreation', function(req, res) {
//     res.render('schedule', {});
// });

router.post('/schedule', function(req, res) {
    //receive the data and set it up in usable form
    var startDate = new Date(JSON.parse(req.body.startDate));
    var length = parseInt(req.body.length);
    var hours = req.body['hours[]'];
    if (hours)
        for (var i = 0; i < hours.length; i++)
            hours[i] = parseInt(hours[i]);
    var rooms = req.body['rooms[]'];
    if (rooms)
        for (var i = 0; i < rooms.length; i++)
            rooms[i] = parseInt(rooms[i]);

    // console.log(startDate);
    // console.log(length);
    // console.log(hours);
    // console.log(rooms);

    //add the schedule to the database
    var msg = "Request successfully added!";

    var schedule = adminFuncs.createSchedule(startDate, length, hours, rooms);
    adminFuncs.addSchedule(schedule).then(function (data){
        if (data) {
            console.log(data);
            msg = "Request failed, please try again.";
        }

        res.send({msg: msg});
    });
});

router.post('/status', function(req, res) {
    //Get the data from the body of the request
    var roomID = req.body['roomID[]'];
    var toDisable = req.body['toDisable[]'];


    console.log(roomID);
    console.log(toDisable);

    var msg = "Status of room set successfully";
    if (roomID) {
        for (var i = 0; i < roomID.length; i++) {
            adminFuncs.setStatus(parseInt(roomID[i]), true).then(function (err) {
                if (err) {
                    console.log(err);
                    msg = "Something went wrong, please try again.";
                }
            });
        }
    }
    if (toDisable) {
        for (var i = 0; i < toDisable.length; i++) {
            adminFuncs.setStatus(parseInt(toDisable[i]), false).then(function (err) {
                if (err) {
                    console.log(err);
                    msg = "Something went wrong, please try again.";
                }
            })
        }
    }

    res.send({msg: msg});
});

export default router;
