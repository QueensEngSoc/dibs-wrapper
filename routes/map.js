// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var path = require('path');

var roomFuncs = require('./roomDatabase');

router.get('/map', function (req, res, next) { //the request to render the page


    var dateObj = new Date();
    var current_hour = dateObj.getHours();


    roomFuncs.getListOfRoomState(dateObj.getDate(), current_hour).then(function(listFree){
        var testStatus = [];

        testStatus.push({
            room: "Room 111",
            roomNum: "bmh111",
            isFree: true
        });

        var jsonList = JSON.stringify(listFree);

        res.render('map', {    // render the page with server side variables passed to the client
            // vars go here, like if a room is booked or not
            title: "D!Bs Map View",
            roomStatus: jsonList,
            currentHour: current_hour
        });

    });


});

module.exports = router;