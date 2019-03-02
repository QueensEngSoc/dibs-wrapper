const express = require('express');
const router = express.Router();
const accountFuncs = require('../src/lib/userFunctions');
const roomBook = require('../models/roomBooking');

router.post('/bookroom', async function (req, res) {
    const roomToBook = JSON.stringify(req.body);
    const obj = JSON.parse(roomToBook);

    const bookingTimeStart = parseInt(obj.time, 10);
    const roomID = parseInt(obj.roomID, 10);
    const usrid = accountFuncs.getUserID(req);
    const day = parseInt(obj.day, 10);
    const length = parseInt(obj.length, 10);

    if (usrid == -1 || usrid == undefined) {
        res.send({
            HeaderMsg: "You must login",
            BookingStatusMsg: ' ',
            BookStatus: false
        });
    }
    else {
        const bookingResponse = await roomBook.bookRoom(day, bookingTimeStart, roomID, length, usrid, req);
        console.log('***********************', bookingResponse);
        console.log("Request Body: " + JSON.stringify(req.body) + " room id: " + roomToBook + " Success: " + bookingResponse.success);
        res.send({ HeaderMsg: bookingResponse.header, BookingStatusMsg: bookingResponse.bookMsg, BookStatus: bookingResponse.success });
    }
});

export default router;
