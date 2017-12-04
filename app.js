var express = require('express');
var path = require('path');
var sql = require('mssql');

var server = express();

var config = {
    user: 'user',
    password: 'dibswrapper',
    server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    database: 'master',

    options: {
    }
}
sql.connect(config, function (err) {
    console.log(err);
    var request = new sql.Request();

    request.query('select @@servername', function (err, r) {
        console.log(err);
        console.log(r);
    });
});

server.use('/public', express.static('public'));
server.use('/HTML', express.static('HTML'));

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/HTML/temptest.html'));
});

server.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});

