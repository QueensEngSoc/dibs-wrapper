var express = require('express');
var router = express.Router();
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
var accountFuncs = require('../models/userFunctions');

router.get('/book/:roomName/', function (req, res, next) {
    var room = req.params.roomName;
    room = room.toUpperCase();
    room = room.replace(/-/g, ' '); // strip out dashes

    roomDB.getInfoByName(room).then(function (out) {
        var roomID = out.roomid;

        roomDB.getFree(0, roomID).then(function (out1) { //so this is the dumbest thing ever XD, we'll talk
            var usrid = accountFuncs.getUserID(req);
            out.userid = usrid;
            out.free = out1;
            out.navLink = '<a href="/" style="color: #fff;">GRID</a>';
            out.navPic = '<a href="/" style="padding-top: 5px;"><img src="/img/grid.png" height="30" width="30"></a>';

            res.render('roomInfo', out);
        });
    }).catch(function(data, i) {
        return res.redirect('/404');
    });
});

module.exports = router;