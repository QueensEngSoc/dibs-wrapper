import express from "express";

import configRoutes from "./config/routes.js";
import configPassport from "./config/passport";
import path from "path";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";
import mongoose from "mongoose";
import flash from "connect-flash";
import configDB from "./config/database.js";
import * as dbFuncs from "./models/dbFunctions";
import * as email from "./models/sendEmail";

import './src/SCSS/main.scss';

const server = express(); //initialize the server

//Here you can pass helpers that you would normally define in registerHelpers
//and you can also define stuff like `defaultLayout` and `partialsDir`
const hbs = exphbs.create({
    helpers: {      // These are right now just in here for fun / testing, realistically we probably won't need to use
        //handlers for anything, since AJAX and JQuery are much easier to use, and much more powerful.  That being said,
        // having a few examples is probably fairly useful, so I will leave these in for now.
        getStringifiedJson: function (value) {
            return JSON.stringify(value);
        },
        if_eq: function (a, b, opts) {
            if (a == b) // Or === depending on your needs
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        if_time: function (a, opts) { // this function checks if the passed time (a) is less than the current time
            const date = new Date();
            const current_hour = date.getHours();
            const current_min = date.getMinutes();    // check if the time is less than the current hour, since there is no
                                                    // point in unbooking a event from the past

            if (a < current_hour - 1 || (a < current_hour && current_min > 30))
                return opts.inverse(this);
            else
                return opts.fn(this);

        },
        if_time_plus_len: function (a, b, opts) { // this function checks if the passed time (a) is less than the current time
            const date = new Date();
            const current_hour = date.getHours();
            const current_min = date.getMinutes();    // check if the time is less than the current hour, since there is no
                                                    // point in unbooking a event from the past

            if (a + b - 1 < current_hour - 1 || (a + b - 1 < current_hour && current_min > 30))
                return opts.inverse(this);
            else
                return opts.fn(this);

        },
        if_valid: function (a, opts) { // this function checks if the passed time (a) is less than the current time
            const min = new Date().getMinutes();
            if ((a < 0) || (a > 16) || (a == 0 && min >= 30) || (a == 16 && min < 30))
                return opts.inverse(this);
            else
                return opts.fn(this);

        },
        getTimes: function (free, owner, day, room) {
            const times = [];
            for (slot of free) {
                console.log(slot);
                if (slot.owner == owner) {
                    times.push(slot.time);
                }
            }

            let msg = "";
            for (i in times) {
                const time = times[i];
                msg += time + (i == times.length - 1 ? "" : ", ");
            }
            return "<h4 class='card-title' name='bookingTime'>" + day + ": " + room + " - " + msg + "</h4>";
        }
    },
    defaultLayout: 'main'
});

// configuration ===============================================================
let env = process.env.NODE_ENV || 'dev';
if (env == 'dev')
    mongoose.connect(configDB.accountURL); // connect to our database ->: fixed depreciation warning (it was a bug :P  https://github.com/Automattic/mongoose/issues/5399)
else
    mongoose.connect('mongodb://heroku_5h907111:qiobas1eprl1uddidasas235mt@ds253918.mlab.com:53918/heroku_5h907111');

configPassport(passport); // pass passport for configuration

// Routes - moved to config/routes.js //

//View Engine
// server.engine('handlebars', exphbs({defaultLayout: 'main'}));
server.engine('handlebars', hbs.engine); //setting the view engine to render handlebars pages
server.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
server.use(bodyParser.json()); //need body parser to parse JSON objects
server.use(bodyParser.urlencoded({extended: false}));

// Authentication stuffs //
server.use(cookieParser()); // read cookies (needed for auth)
///

//Database setup and initialization
const monk = require('monk');
env = process.env.NODE_ENV || 'dev';

if (env == 'dev')
    var db = monk('localhost:27017/roomDatabase');
else
    var db = monk('mongodb://heroku_08d6gg04:tbjjetli24bdv2nqrpiu6gdlta@ds153978.mlab.com:53978/heroku_08d6gg04');

server.use(function (req, res, next) { //making database accessible to the router
    req.db = db;
    next();
});

// more auth stuff with passport //
// followed this: https://scotch.io/tutorials/easy-node-authentication-setup-and-local //
server.use(require('express-session')({
    secret: 'CarsonIsTotallyNotDrunkInGifyVideo',
    resave: false,
    saveUninitialized: false
}));
server.use(passport.initialize());
server.use(passport.session()); // persistent login sessions
server.use(flash()); // use connect-flash for flash messages stored in session
//

//Serving files
server.use(express.static(path.join(__dirname, 'public')));

// routes ======================================================================
configRoutes(server, passport); // load our routes and pass in our app and fully configured passport
// end for auth section //

// email.setupMailSender(); // ToDo: Get the correct username / password so this works again

// setUpMuiStyles();   // set up the inline styles using cssInJS from MaterialUI

//Run server
const port = process.env.PORT || 8000;

server.listen(port, function () {
    console.log('QBook listening on port ' + port + "!");
});

if (env != 'dev'){
    const http = require("http");
    console.log("Setting up ping service to keep the Heroku site awake (fixing the lag and dayShifting code breaking)");
    setInterval(function() {
        http.get("http://dibs-beta.herokuapp.com");
        console.log("Ping......");
    }, 300000); // every 5 minutes (300000)
}

dbFuncs.setupEndOfDayScript();
export default server;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                              HOW TO USE THIS APP                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// to get this app to work, create a directory somewhere where you want MongoDB to hold the database.
// Open a CMD window, and navigate to the MongoDB/bin folder (Where you installed MongoDB)
// You then have to type the following command within CMD:
//                  mongod --dbpath path\to\where\you\want\your\database
// where path\to\where\you\want\your\database is wherever you want the database to be (I have it in the MongoDB folder
// within the project. You then have to open a new CMD window in the same spot, and type
//                  mongo
//                  use roomDatabase
//
//  You can then run grabJSONS to set up the database, then run the app with `npm run debug`.  Navigate to localhost:8000 and it
//  should work!
//
//  To view information in the database, type
//                  db.roomDatabase.find().pretty()
//
//  Also note: if the app crashes for seemingly no reason, or you get a "Cannot set headers after they are sent to
//  the client" error, do the following:
//  in a CMD window within the MongoDB/bin folder, type the following command:
//                  db.roomDatabase.drop()
//
//  if it returns true in the console, it worked!  You then have to re-run the grabJSON.js file, and the
//  app should now work without issues
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

