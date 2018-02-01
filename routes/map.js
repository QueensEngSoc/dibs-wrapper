// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var path = require('path');

var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../models/userFunctions');

router.get('/map', function (req, res, next) { //the request to render the page


    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();

    if (current_min < 30)   // logic here is that we are returning the status based on the start hour.  Since the min booking time is
        current_hour --;    // 1 hour, if the current minute is less than 30, we are still within the previous booking slot
                            // and we should therefore subtract 1 from the hour to get the right data (eg. if it is 7:10pm
                            // right now, then we really want the data from 6:30 - 7:30, not 7:30 - 8:30)

    var usrid = accountFuncs.getUserID(req);

    roomFuncs.getListOfRoomState(dateObj.getDate(), current_hour, usrid).then(function(listFree){
        var jsonList = JSON.stringify(listFree);

        res.render('map', {    // render the page with server side variables passed to the client
            // vars go here, like if a room is booked or not
            title: "D!Bs Map View",
            roomStatus: jsonList,
            currentHour: current_hour,
            navLink: '<a href="/" style="color: #fff;">GRID</a>',
            navPic: '<a href="/" style="padding-top: 5px;"><img src="/img/grid.png" height="30" width="30"></a>'
        });

    });


});

module.exports = router;