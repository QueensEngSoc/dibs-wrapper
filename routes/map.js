// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();

var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../models/userFunctions');

router.post('/map', function (req, res) {
    var data = JSON.stringify(req.body);
    var obj = JSON.parse(data);
    var dateStr = obj.day;
    var date = new Date(dateStr);

    var dateObj = new Date();
    current_hour = dateObj.getHours();
    // var current_min = dateObj.getMinutes();
    var day = date - dateObj;
    day = Math.ceil(day / (1000 * 3600 * 24));

    var hour = parseInt(obj.time, 10);
    if (day == 0 && hour < current_hour - 1)
        hour = current_hour - 1;

    var usrid = accountFuncs.getUserID(req);

    roomFuncs.getListOfRoomState(day, hour, usrid).then(function (listFree) {
        var jsonList = JSON.stringify(listFree);

        res.send({
            list: listFree,
            roomStatus: jsonList,
            currentHour: hour
        });
    });
});

router.get('/map', function (req, res, next) {


    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();
    var day = 0;

    if (current_min < 30)   // logic here is that we are returning the status based on the start hour.  Since the min booking time is
        current_hour--;    // 1 hour, if the current minute is less than 30, we are still within the previous booking slot
                           // and we should therefore subtract 1 from the hour to get the right data (eg. if it is 7:10pm
                           // right now, then we really want the data from 6:30 - 7:30, not 7:30 - 8:30)

    var usrid = accountFuncs.getUserID(req);

    roomFuncs.getListOfRoomState(day, current_hour, usrid).then(function (listFree) {
        var jsonList = JSON.stringify(listFree);

        res.render('map', {    // render the page with server side variables passed to the client
            // vars go here, like if a room is booked or not
            title: "D!Bs Map View",
            roomStatus: jsonList,
            currentHour: current_hour,
            theme: req.theme === "custom" ? false : req.theme,
            colors: req.colors
        });

    });


});

module.exports = router;