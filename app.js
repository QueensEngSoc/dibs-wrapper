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