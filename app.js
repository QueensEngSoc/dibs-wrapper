var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
// var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var configDB = require('./config/database.js');

var server = express(); //initialize the server

//Here you can pass helpers that you would normally define in registerHelpers
//and you can also define stuff like `defaultLayout` and `partialsDir`
var hbs = exphbs.create({
    helpers: {      // These are right now just in here for fun / testing, realistically we probably won't need to use 
                    //handlers for anything, since AJAX and JQuerry are much easier to use, and much more powerful.  That being said,
                    // having a few examples is probably fairly useful, so I will leave these in for now.
        getStringifiedJson: function (value) {
            return JSON.stringify(value);
        },
        if_eq: function(a, b, opts) {
            if (a == b) // Or === depending on your needs
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        if_time: function(a, opts){ // this function checks if the passed time (a) is less than the current time
            var date = new Date();
            var current_hour = date.getHours();
            var current_min = date.getMinutes();    // check if the time is less than the current hour, since there is no
                                                    // point in unbooking a event from the past

            if (a < current_hour - 1 || ( a < current_hour && current_min > 30 ))
                return opts.inverse(this);
            else
                return opts.fn(this);

        }
    },
    defaultLayout: 'main',
});

// configuration ===============================================================
mongoose.connect(configDB.accountURL); // connect to our database
// comment out passport auth system for now
require('./config/passport')(passport); // pass passport for configuration
// enable this when ready for auth

//Routes - moved to config/routes.js

//View Engine
// server.engine('handlebars', exphbs({defaultLayout: 'main'}));
server.engine('handlebars', hbs.engine); //setting the view engine to render handlebars pages
server.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
server.use(bodyParser.json()); //need body parser to parse JSON objects
server.use(bodyParser.urlencoded({ extended: false }));

// Authentication stuffs //
server.use(cookieParser()); // read cookies (needed for auth)
///

//Database setup and initialization
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');

server.use(function(req, res, next) { //making database accessible to the router
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
require('./config/routes.js')(server, passport); // load our routes and pass in our app and fully configured passport
// end for auth section //

//Run server
server.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});

/*
server.get('/home', function(req, res){
    res.render('home');
});*/

module.exports = server;


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
//  You can then run grabJSONS to set up the database, then run the app with app.js.  Navigate to localhost:8000 and it
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

