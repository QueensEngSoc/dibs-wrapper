var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    var db = req.db;
    var roomInfo = db.get('roomInfo');
    roomInfo.find({}, function(e, result) {
        res.render('test', {
            room: result
        });
    });
});

module.exports = router;