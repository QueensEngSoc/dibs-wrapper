import { setCurrentHour, setRooms, setTimeCount } from '../src/store/actions/rooms';
import template from '../src/server/template';
import createStore from '../src/store/createStore';
import renderAppToString from "../src/server/renderAppToString";

import * as roomDB from '../models/roomDatabase.js'; //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
import * as accountFuncs from '../models/userFunctions';

const express = require('express');
const router = express.Router();

async function createStoreInstance(req, data, current_hour, timeCount) {
  const store = createStore({});
  await store.dispatch(setRooms(data));
  await store.dispatch(setCurrentHour(current_hour));
  await store.dispatch(setTimeCount(timeCount));
  return store;
}

router.get('/react', async function (req, res, next) {
  var dateObj = new Date();
  var current_hour = dateObj.getHours();
  var current_min = dateObj.getMinutes();
  var day = 0;

  if (current_min < 30)   // logic here is that we are returning the status based on the start hour.  Since the min booking time is
    current_hour--;       // 1 hour, if the current minute is less than 30, we are still within the previous booking slot
                          // and we should therefore subtract 1 from the hour to get the right data (eg. if it is 7:10pm
                          // right now, then we really want the data from 6:30 - 7:30, not 7:30 - 8:30)

  var userid = accountFuncs.getUserID(req);

  const listFree = await roomDB.getListOfRoomState(day, -1, userid);
  var timecount = [];

  var startCheck = (current_hour < 7) ? 7 : current_hour;

  for (let i = startCheck - 7; i < listFree[i].isFree.length; i++) {
    let amOrPm = (startCheck >= 11) ? " PM" : " AM";
    const startTime = (((i + 7) % 12 === 0) ? '12' : (i + 7) % 12) + ":30";
    const endTime = (((i + 7 + 1) % 12 === 0) ? '12' : (i + 7 + 1) % 12) + ":30";

    timecount.push({
      hourCount: 0,
      totalCount: 0,
      timeString: startTime + '-' + endTime + amOrPm,
      totalFree: 0,
      hour: (i + 7) % 12,
      twenty4Hour: i + 7,
      pillClass: 'badge-success'
    });
  }

  for (var i = 0; i < listFree.length; i++) {
    var count = 0;
    var mine = 0;
    for (var j = startCheck - 7; j < listFree[i].isFree.length; j++) {
      if (!listFree[i].isFree[j].free) {
        count++;
        timecount[j - startCheck + 7].hourCount++;
      }

      if (listFree[i].isFree[j].owner == userid) {
        mine++;
        listFree[i].isFree[j].isMine = true;
      } else
        listFree[i].isFree[j].isMine = false;

      timecount[j - startCheck + 7].totalCount++;
    }
  }

  for (var i = 0; i < timecount.length; i++)
    timecount[i].totalFree = timecount[i].totalCount - timecount[i].hourCount;

  const store = await createStoreInstance(req, listFree, current_hour, timecount);
  const context = {};
  const body = renderAppToString(req, context, store);
  const title = 'Server side Rendering with Styled Components';
  const theme = req.theme === "custom" ? false : req.theme || 'default';
  const cssPath = ['/CSS/styles.css', `/CSS/room-style/${theme}-room-style.css`, '/CSS/React/home.css'];

  res.send(template({
    body,
    title,
    cssPath
  }));

});

function formatDate(date) {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export default router;
