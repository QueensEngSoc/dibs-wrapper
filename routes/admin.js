var express = require('express');
var router = express.Router();
var adminFuncs = require('../models/adminDatabase');

router.get('/admin', function(req, res) {
    adminFuncs.getAll().then(function(data) {
        res.render('admin', {list: data});
    });
});

// router.get('/schedulecreation', function(req, res) {
//     res.render('schedule', {});
// });

router.post('/admin', function(req, res) {
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

module.exports = router;