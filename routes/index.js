var express = require('express');
var router = express.Router();
var path = require('path');

// console.log(path.join(__dirname, '/../'));


router.post('/book', function (req, res) {
    var roomToBook = JSON.stringify(req.body);
    roomToBook = roomToBook.substr(roomToBook.indexOf('[') + 1);
    var bookingTimeStart = roomToBook.substr(roomToBook.indexOf(',') + 1);
    roomToBook = roomToBook.substr(0, roomToBook.indexOf(','));
    bookingTimeStart = bookingTimeStart.substr(0,bookingTimeStart.indexOf(']'));

    console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook);
    bookRoom(roomToBook, bookingTimeStart, "Alex", "", "macsplash3@gmail.com", "").then(function () {
        var header = (bookRoomReturnObj == true) ? "Booking Successful!" : bookRoomReturnObj;
        bookRoomReturnObj = bookRoomReturnObj.substr(bookRoomReturnObj.indexOf("\"Message\":") + 11, bookRoomReturnObj.indexOf('"}'));
        if (bookRoomReturnObj.length < 5)
            bookRoomReturnObj = "Error: Dibs room booking features have been temporarily disabled.  To book a room, please use Dibs :(";
        console.log("Sending: " + header + " -> " + bookRoomReturnObj + " -> ");
        res.send({jadeHeader: header, jadeBookingStatus: bookRoomReturnObj});
    });
});

// var context = {
//     items: [
//         {name: "Handlebars", emotion: "love"},
//         {name: "Mustache", emotion: "enjoy"},
//         {name: "Ember", emotion: "want to learn"}
//     ]
// };
//
// router.registerHelper('agree_button', function() {
//     var emotion = Handlebars.escapeExpression(this.emotion),
//         name = Handlebars.escapeExpression(this.name);
//
//     return new Handlebars.SafeString(
//         "<button>I agree. I " + emotion + " " + name + "</button>"
//     );
// });

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
        phone: "Error",
        special: "Error",
        tempImgURL: "",
        free: []
    };

    var roomID = 1;


    var roomInfo = req.db.get('roomDatabase');
    roomInfo.find({RoomID: roomID}).each(function(data, val) {
        out.room = data.Name;
        out.size = data.Description;
        out.tempImgURL = data.Picture;
        out.tv = data.tv;
        out.phone = data.phone;
        out.special = data.special;
        out.free = data.Free;
        res.render('test', out);
    });

});

module.exports = router;