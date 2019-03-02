// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();

var roomFuncs = require('../models/roomDatabase');
var accountFuncs = require('../src/lib/userFunctions');

router.post('/map', async function (req, res) {
    const data = JSON.stringify(req.body);
    var obj = JSON.parse(data);
    var dateStr = obj.day;
    var date = new Date(dateStr);

    var dateObj = new Date();
    const current_hour = dateObj.getHours();
    // var current_min = dateObj.getMinutes();
    var day = date - dateObj;
    day = Math.ceil(day / (1000 * 3600 * 24));

    var hour = parseInt(obj.time, 10);
    if (day == 0 && hour < current_hour - 1)
        hour = current_hour - 1;

    var usrid = accountFuncs.getUserID(req);

    const listFree = await roomFuncs.getListOfRoomState(day, -1, usrid);
    var timecount = [];

    for (var i = 0; i < listFree[i].isFree.length; i++) {
        timecount.push({
            hourCount: 0,
            totalCount: 0
        });
    }

    for (var i = 0; i < listFree.length; i++) {
        var count = 0;
        var mine = 0;
        for (var j = 0; j < listFree[i].isFree.length; j++) {
            if (!listFree[i].isFree[j].free) {
                count++;
                timecount[j].hourCount++;
            }
            if (listFree[i].isFree[j].owner == usrid) {
                mine++;
                listFree[i].isFree[j].isMine = true;
            } else
                listFree[i].isFree[j].isMine = false;

            timecount[j].totalCount++;
        }
    }

    var jsonTimeCount = JSON.stringify(timecount);
    var jsonList = JSON.stringify(listFree);
    var prettyDate = formatDate(date);

    res.send({
        list: listFree,
        roomStatus: jsonList,
        currentHour: hour,
        timeCount: jsonTimeCount,
        prettyDate: prettyDate
    });
});

router.get('/map', async function (req, res, next) {


    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();
    var day = 0;

    if (current_min < 30)   // logic here is that we are returning the status based on the start hour.  Since the min booking time is
        current_hour--;    // 1 hour, if the current minute is less than 30, we are still within the previous booking slot
                           // and we should therefore subtract 1 from the hour to get the right data (eg. if it is 7:10pm
                           // right now, then we really want the data from 6:30 - 7:30, not 7:30 - 8:30)

    var usrid = accountFuncs.getUserID(req);

    const listFree = await roomFuncs.getListOfRoomState(day, -1, usrid);
    var timecount = [];

    for (var i = 0; i < listFree[i].isFree.length; i++) {
        timecount.push({
            hourCount: 0,
            totalCount: 0
        });
    }

    for (var i = 0; i < listFree.length; i++) {
        var count = 0;
        var mine = 0;
        for (var j = 0; j < listFree[i].isFree.length; j++) {
            if (!listFree[i].isFree[j].free) {
                count++;
                timecount[j].hourCount++;
            }
            if (listFree[i].isFree[j].owner == usrid) {
                mine++;
                listFree[i].isFree[j].isMine = true;
            } else
                listFree[i].isFree[j].isMine = false;

            timecount[j].totalCount++;
        }
    }

    var jsonTimeCount = JSON.stringify(timecount);
    var jsonList = JSON.stringify(listFree);
    // var prettyDate = formatDate(date);

    res.render('map', {    // render the page with server side variables passed to the client
        // vars go here, like if a room is booked or not
        title: "D!Bs Map View",
        roomStatus: jsonList,
        currentHour: current_hour,
        theme: req.theme === "custom" ? false : req.theme,
        colors: req.colors,
        timeCount: jsonTimeCount,
        isLoggedIn: req.isAuthenticated()
    });

});

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

export default router;
