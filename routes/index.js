var express = require('express');
var router = express.Router();
var roomDB = require('../models/roomDatabase.js'); //the roomDatabase interface which provide 5 functions. Look in the file for how to use them
var accountFuncs = require('../models/userFunctions');

router.post('/index', async function (req, res) {
  var data = JSON.stringify(req.body);
  var obj = JSON.parse(data);
  var dateStr = obj.day;
  var date = new Date(dateStr);

  const dateObj = new Date();
  var current_hour = dateObj.getHours();
  var current_min = dateObj.getMinutes();
  var day = date - dateObj;
  day = Math.ceil(day / (1000 * 3600 * 24));

  if (day < 0 || day > 13)
    res.send("404", {
      list: "",
      prettyDate: ""
    });

  else {
    if (current_min < 30)
      current_hour--;

    var usrid = accountFuncs.getUserID(req);

    const listFree = await roomDB.getListOfRoomState(day, -1, usrid);
    var timecount = [];

    for (var i = 0; i < listFree[i].isFree.length; i++) {
      timecount.push({
        hourCount: 0,
        totalCount: 0
      });
    }

    for (var i = 0; i < listFree.length; i++) {
      var count = 0;
      var mine = 0;
      for (var j = 0; j < listFree[i].isFree.length; j++) {
        if (!listFree[i].isFree[j].free) {
          count++;
          timecount[j].hourCount++;
        }
        if (listFree[i].isFree[j].owner == usrid) {
          mine++;
          listFree[i].isFree[j].isMine = true;
        } else
          listFree[i].isFree[j].isMine = false;

        timecount[j].totalCount++;
      }
    }

    for (var i = 0; i < timecount.length; i++)
      timecount[i].totalFree = timecount[i].totalCount - timecount[i].hourCount;

    var prettyDate = formatDate(date);

    res.send({
      list: listFree,
      timeCount: timecount,
      currentHour: current_hour,
      prettyDate: prettyDate,
      day: day
    });
  }
});

router.get('/', async function (req, res, next) {
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

    timecount.push({
      hourCount: 0,
      totalCount: 0,
      timeString: (i + 7) % 12 + ":30-" + (i + 7 + 1) % 12 + ":30" + amOrPm,
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

  var jsonList = JSON.stringify(listFree);
  // var prettyDate = formatDate(date);

  res.render('index', {
    list: listFree,
    navLink: '<a href="/map" class="nav-link white">Map<img src="/img/map.png" class="li-spacing" height="30" width="70"></a>',
    navPic: '<a href="/map"><img src="/img/map.png" height="35" width="60"></a>',
    isLoggedIn: req.isAuthenticated(),
    theme: req.theme === "custom" ? false : req.theme,
    colors: req.colors,
    timeCountObj: timecount,
    timeCountObjStr: JSON.stringify(timecount),
    listFree: jsonList,            // stores the free arrays for each room, for the selected day
    currentTime: current_hour - 7
  });
});

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export default router;
