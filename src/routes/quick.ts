import { setCurrentHour } from '../store/actions/rooms';
import template from '../server/template';
import createStore from '../store/createStore';
import renderAppToString from '../server/renderAppToString';

import * as roomDB from '../../models/roomDatabase'; //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
import { bookMultiple } from '../lib/roomBooking';
import * as accountFuncs from '../lib/userFunctions';
import { setAccountType, setLoggedIn } from '../store/actions/user';
import { compile } from '../server/compileSass';
import { UserAccountType } from '../types/enums/user';

const express = require('express');
const router = express.Router();

async function createStoreInstance(req, current_hour) {
  const store = createStore({});
  await store.dispatch(setCurrentHour(current_hour));
  await store.dispatch(setLoggedIn(req.isAuthenticated()));

  const accountType = accountFuncs.getAdminStatus(req) ? UserAccountType.Admin : UserAccountType.Regular;
  await store.dispatch(setAccountType(accountType));
  return store;
}

router.get('/quicky', async function (req, res, next) { //the request to render the page
  if (!req.isAuthenticated())
    return res.redirect('/login?redirect=/quicky');

  const dateObj = new Date();
  var current_hour = dateObj.getHours();
  const current_min = dateObj.getMinutes();

  if (current_min < 30)   // logic here is that we are returning the status based on the start hour.  Since the min booking time is
    current_hour--;       // 1 hour, if the current minute is less than 30, we are still within the previous booking slot
                          // and we should therefore subtract 1 from the hour to get the right data (eg. if it is 7:10pm
                          // right now, then we really want the data from 6:30 - 7:30, not 7:30 - 8:30)

  const store = await createStoreInstance(req, current_hour);
  const context = {};
  const { html: body, css: MuiCss } = renderAppToString(req, context, store);
  const title = 'Quick Book';
  const theme = req.theme === "custom" ? false : req.theme || 'default';
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

router.post('/quicky', async function (req, res, next) {
  console.log('got the post! ***************** ', req.isAuthenticated());
  if (!req.isAuthenticated())
    return false; // do the redirecting thing TODO: Alex?

  var usrid = accountFuncs.getUserID(req);
  var bookDay = 0;

  const data = JSON.stringify(req.body);
  const dataObj = JSON.parse(data);

  // var time = figureOutNextValidTime(usrid);
  const out = await roomDB.getNextFree();
  if (out === {})
    return res.send('No free rooms!');
  const date = new Date();
  const quick = accountFuncs.getQuickyStatus(req);
  console.log('time (pt 0) is: ', (dataObj && dataObj.time), ' next valid: ', roomDB.getNextValidHalfHour(false, true), ' quick: ', quick);
  var time = (dataObj && dataObj.time) || roomDB.getNextValidHalfHour(false, true);
  console.log('time (pt 1) is: ', time, ' quick: ', quick);

  const minute = new Date().getMinutes();
  if (minute < 30)
    time --;

  if (time >= 23) {
    time = time % 23 + 7;
    bookDay++;
  }
  console.log('time is: ', time, ' quick: ', quick, ' bookDay ', bookDay);

  try {
    const data = await bookMultiple(bookDay, [time], out, usrid, req);
    console.log('data ', data);
    if (data.header.indexOf('Booking Success!') >= 0) {
      quick.number++;
      if (isNaN(quick.number) || quick.date !== date.toDateString())
        quick.number = 1;
      quick.date = date.toDateString();
      accountFuncs.setQuickyStatus(req, quick);
      // if (bookDay > 0)
      //   data.bookMsg += ' tomorrow';
    }
    res.send(data);
  } catch (err) {
    console.log(err);
    res.send('An error occurred while rushing to Automagically™ QuickBook™ your room.')
  }

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
