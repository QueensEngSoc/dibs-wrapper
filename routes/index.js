var express = require('express');
var router = express.Router();
var path = require('path');

// console.log(path.join(__dirname, '/../'));

router.get('/', function (req, res, next) {
    // var db = req.db;
    // var roomInfo = db.get('roomInfo');
    // roomInfo.find({}, function(e, result) {
    //     res.render('test', {
    //         room: result
    //     });
    // });
    var out = {
        room: "Error",
        size: "Error",
        tv: "Error",
        special: "Error",
        tempImgURL: "",
        free: []
    };

    var roomID = 1;

    var roomInfo = req.db.get('roomInfo');
    roomInfo.find({RoomID: roomID}).each(function(data, val) {
        out.room = data.Name;
        out.size = data.Description;
        out.tempImgURL = data.Picture;
        out.free = data.Free;
        res.render('test', out);
    });
});

module.exports = router;