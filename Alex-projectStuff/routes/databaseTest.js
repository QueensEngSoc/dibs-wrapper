var express = require('express');
var router = express.Router();
var date = '10-23-2017';
var dateOBJ;
var bookRoomReturnObj = "";

/* GET home page. */
function getDate() {
    var dateObj = new Date();
    var current_hour = dateObj.getHours();
    dateObj.setDate(dateObj.getDate());
    dateObj.toDateString();
    // console.log("DATE IS: " + dateObj);
    date = (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();
    dateOBJ = dateObj;
}


router.get('/', function (req, res, next) {

    var db = req.db;    // get the connected database (from http://localhost:27017/roomDatabase), which is the default port for MongoDB
    var collection = db.get('usercollection'); // change this later to like roomCollection or something more sensical, I'm lazy, so ima do it later
    console.log("\n\nCollection Contains:\n");  // print out the returned collection for convenience (and because Michael looooovvveeeesss my over-use of logging :P

    collection.find({},{},function(e,resultReturned){   // return the actual data in the database, you could also make a SQL (or Mongo?) query here to only get specific stuff
        console.log(resultReturned);    // log out the returned data (I just grabbed it from the DIBS API, so it's the right data, just formatted shittly (fun fact, room 342 is actually room 324` for some reason ¯\_(ツ)_/¯ )

        res.render('databaseTest', {    // render the page with mah beautiful title
            title: 'NotD!bs Database Test v1.0.0.1.a.r2 omega',
            jadeRooms: resultReturned   // the returned JSON object from the database
        });

    });



});

module.exports = router;
