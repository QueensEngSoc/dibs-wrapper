import express from 'express';
import { getUserID } from '../lib/userFunctions';
import { bookMultiple, bookMultipleByName } from '../lib/roomBooking';

const router = express.Router();
router.post('/bookroom', async function (req, res) { // similar to the book function with a few changes which will be commented below
  console.log('got the post! ', req.body);
  const roomToBook = JSON.stringify(req.body);
  const postData = JSON.parse(roomToBook);

  const roomName = postData.roomName;
  const usrid = getUserID(req);
  const day = parseInt(postData.day, 10);
  const times = Array.isArray(postData.times) ? postData.times : [postData.times]; // get the array of times sent over (instead of a singular one)
  console.log('post: ', roomName, usrid, day, times);
  if (usrid === -1 || usrid === undefined) {
    req.flash('bookingMessage', roomToBook);
    res.send({
      HeaderMsg: 'You must login',
      BookingStatusMsg: roomName + '-' + times[0] + '-' + 1 + '-' + day,
      BookStatus: false
    });
  } else {
    console.log('booking');
    await book(day, times, roomName, usrid, req, res); // the function to book the room
  }
});

async function book(day, times, roomName, usrid, req, res) {
  console.log('booking: ', day, times, roomName, usrid, req, res);
  const data = await bookMultipleByName(day, times, roomName, usrid, req); //Similar to the bookRoom function with a few minor differences
  console.log('Request Body: ' + JSON.stringify(req.body) + ' room id: ' + roomName + ' Success: ' + data.success);
  res.send({ HeaderMsg: data.header, BookingStatusMsg: data.bookMsg, BookStatus: data.success });
}

export default router;
