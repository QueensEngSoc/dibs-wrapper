var express = require('express');
var router = express.Router();
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
var accountFuncs = require('../models/userFunctions');

router.post('/index', function (req, res) {
    var data = JSON.stringify(req.body);
    var obj = JSON.parse(data);
    var dateStr = obj.day;
    var date = new Date(dateStr);

    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();
    var day = date - dateObj;
    day = Math.ceil(day / (1000 * 3600 * 24));

    if (current_min < 30)
        current_hour--;

    var usrid = accountFuncs.getUserID(req);

    var prettyDate = formatDate(date);

    roomDB.getListOfRoomState(day, current_hour, usrid).then(function (listFree) {
        res.send({
            list: listFree,
            prettyDate: prettyDate
        });
    });
});

router.get('/', function (req, res, next) {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();
    var day = 0;

    if (current_min < 30)
        current_hour--;

    var usrid = accountFuncs.getUserID(req);

    roomDB.getListOfRoomState(day, current_hour, usrid).then(function (listFree) {
        res.render('index', {
            list: listFree,
            navLink: '<a href="/map" class="white">MAP<img src="/img/mapfix.png" class="li-spacing" height="30" width="40"></a>',
            navPic: '<a href="/map" style="padding-top: 5px;"><img src="/img/mapfix.png" height="30" width="30"></a>'
        });
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

module.exports = router;