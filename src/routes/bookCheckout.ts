import express from 'express';
import { getUserID } from '../lib/userFunctions';
import { bookMultiple } from '../lib/roomBooking';

const router = express.Router();
router.post('/bookcheckout', async function (req, res) { //similar to the book function with a few changes which will be commented below
  const roomToBook = JSON.stringify(req.body);
  const postData = JSON.parse(roomToBook);

  const roomID = parseInt(postData.roomID, 10);
  const usrid = getUserID(req);
  const day = parseInt(postData.day, 10);
  let times = postData.times; //get the array of times sent over (instead of a singular one)

  if (Array.isArray(times)) { //make sure it's an array
    for (const i in times) {
      times[i] = parseInt(times[i], 10);
    }
  } else {
    times = [times];
  }

  if (usrid === -1 || usrid === undefined) {
    req.flash('bookingMessage', roomToBook);
    res.send({
      HeaderMsg: 'You must login',
      BookingStatusMsg: roomID + '-' + times[0] + '-' + 1 + '-' + day,
      BookStatus: false
    });
  } else {
    await book(day, times, roomID, usrid, req, res); //the function to book the room
  }
});

async function book(day, times, roomID, usrid, req, res) {
  const data = await bookMultiple(day, times, roomID, usrid, req); //Similar to the bookRoom function with a few minor differences
  console.log('Request Body: ' + JSON.stringify(req.body) + ' room id: ' + roomID + ' Success: ' + data.success);
  res.send({ HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success });
}

export default router;
