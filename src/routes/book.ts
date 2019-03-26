import template from '../server/template';
import createStore from '../store/createStore';
import { setCurrentHour, setRooms } from '../store/actions/rooms';
import { setLoggedIn } from '../store/actions/user';
import renderAppToString from '../server/renderAppToString';
import { compile } from '../server/compileSass';
import { DBRoom, Room } from '../types/room';
import { getFreeTable, getInfoByName } from '../lib/roomDatabase';

const express = require('express');
const router = express.Router();
const roomDB = require('../../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
const accountFuncs = require('../lib/userFunctions');

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function createStoreInstance(req, data, current_hour, timeCount) {
  const store = createStore({});
  await store.dispatch(setRooms([data]));
  await store.dispatch(setCurrentHour(current_hour));
  // await store.dispatch(setTimeCount(timeCount));
  await store.dispatch(setLoggedIn(req.isAuthenticated()));
  return store;
}

router.get('/book-v2/:roomName/', async function (req, res, next) {
  const dateObj = new Date();
  let current_hour = dateObj.getHours();
  const day = 0;

  let room = req.params.roomName;
  room = room.toUpperCase();
  room = room.replace(/-/g, ' '); // strip out dashes
  if (room.indexOf('app.bundle.js') >= 0) // https://stackoverflow.com/questions/51358714/react-routing-causes-inexplicable-behavior - no idea why this is happening :(
    return;

  const roomInfo: Room = await getInfoByName(room);
  if (!roomInfo) {
    return null;
  }

  const roomID = roomInfo.roomID;
  const roomFreeTable = await getFreeTable(roomID); //so this is the dumbest thing ever XD, we'll talk
  const usrid = accountFuncs.getUserID(req);
  const imgID = room.replace(/\s+/g, '') + '.jpg';
  roomInfo.userId = usrid;
  roomInfo.Free = roomFreeTable;
  roomInfo.Picture = '../img/' + imgID;
  roomInfo.day = 0;

  const themeColors = req.colors;
  // res.render('roomInfo', { roomData: out, isLoggedIn: req.isAuthenticated() });

  const store = await createStoreInstance(req, roomInfo, current_hour, null);
  const context = {};
  const { html: body, css: MuiCss } = renderAppToString(req, context, store);
  const title = `QBook - Book ${roomInfo.room} for ${dateObj.toDateString()}`;
  const theme = req.theme === 'custom' ? false : req.theme || 'default';
  const cssPath = [`/CSS/room-style/${theme}-room-style.css`];
  const compiledCss = compile('src/SCSS/main.scss');

  res.send(template({
    body,
    title,
    compiledCss,
    cssPath,
    MuiCss
  }));
});

router.get('/book-v2/:roomName/:date', function (req, res, next) {
  let room = req.params.roomName;
  const datestr = req.params.date;

  const parts = datestr.split('-');
  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  const date = new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
  const today = new Date();
  let diff = date - today;
  diff = Math.ceil(diff / (1000 * 3600 * 24));
  //one_day means 1000*60*60*24
  //one_hour means 1000*60*60
  //one_minute means 1000*60
  //one_second means 1000
  if (isNaN(date.getTime())) {  // invalid date, the user only specified the room, not the date as well...
    // do nothing here, and end the "render" call
    res.render('roomInfo');
  } else if (diff < 0) {
    res.render('404', {
      message: '<p>You cannot book in the past! Stop being dumb :P </p>' + '<p>Pick a different time, ' +
        '<a href=\'/\'>Go back to the homepage</a> or <a href=\'/quicky\'>QuickBook a room</a>!</p>',
      image: 'trail.jpg',
      theme: req.theme === 'custom' ? false : req.theme,
      colors: req.colors
    });

  } else {
    room = room.toUpperCase();
    room = room.replace(/-/g, ' '); // strip out dashes

    roomDB.getInfoByName(room).then(async function (out) {
      const roomID = out.roomid;

      const roomFreeTable = await roomDB.getFree(diff, roomID);
      if (roomFreeTable == undefined) {
        let max = addDays(today, 14);

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        res.render('404', {
          message: '<p>You cannot book that far ahead!  The limit is ' + max.toLocaleDateString('en-CA', options) + '</p>' + '<p>Pick a different time, ' +
            '<a href=\'/\'>Go back to the homepage</a> or <a href=\'/quicky\'>QuickBook a room</a>!</p>',
          image: 'trail.jpg',
          theme: req.theme === 'custom' ? false : req.theme,
          colors: req.colors
        });
      } else {
        const usrid = accountFuncs.getUserID(req);
        const imgID = room.replace(/\s+/g, '') + '.jpg';
        out.userid = usrid;
        out.free = roomFreeTable;
        out.imgURL = '../../img/' + imgID;
        out.day = diff;
        out.theme = req.theme === 'custom' ? false : req.theme;
        out.colors = req.colors;
        res.render('roomInfo', { roomData: out, isLoggedIn: req.isAuthenticated() });
      }
    }).catch(function () {
      res.render('404', {
        message: '<p>That room does not exist!</p>' +
          '<p><a href=\'/\'>Go back to the homepage</a> or <a href=\'/quicky\'>QuickBook a room</a>!</p>',
        image: 'trail.jpg',
        theme: req.theme === 'custom' ? false : req.theme,
        colors: req.colors
      });
    });
  }
});

export default router;
