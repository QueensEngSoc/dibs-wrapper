var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');

var server = express();

//Routes
var index = require('./routes/index');

//View Engine
server.engine('handlebars', exphbs({defaultLayout: 'main'}));
server.set('view engine', 'handlebars');

//Database setup and initialization
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/roomDatabase');
server.use(function(req, res, next) { //making database accessible to the router
    req.db = db;
    next();
});

//Serving files
server.use(express.static(path.join(__dirname, 'public')));

//Serving routes
server.use('/', index);

//Run server
server.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});

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

