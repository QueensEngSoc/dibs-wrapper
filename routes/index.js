var express = require('express');
var router = express.Router();
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
var accountFuncs = require('../models/userFunctions');

router.get('/', function (req, res, next) {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    var current_min = dateObj.getMinutes();
    var day = 0;

    if (current_min < 30)
        current_hour --;

    var usrid = accountFuncs.getUserID(req);

    roomDB.getListOfRoomState(day, current_hour, usrid).then(function (listFree) {
        res.render('index', {
            list: listFree,
            navLink: '<a href="/map" class="white">MAP<img src="/img/mapfix.png" class="li-spacing" height="30" width="40"></a>',
            navPic: '<a href="/map" style="padding-top: 5px;"><img src="/img/mapfix.png" height="30" width="30"></a>',
            theme: req.theme === "custom" ? false : req.theme,
            colors: req.colors
        });
    });
});

module.exports = router;