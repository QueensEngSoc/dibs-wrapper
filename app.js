const Sequelize = require('sequelize');
const express = require('express');
const path = require('path');

const server = express();
const sequelize = new Sequelize('database', 'username', 'password',
    {
        host: 'localhost',
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    });
//console.log(sequelize);

server.use('/public', express.static('public'));
server.use('/HTML', express.static('HTML'));

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/HTML/temptest.html'));
});

server.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});

//$('#btnCallDibs').bootstrapBtn('loading'); checkReservation();
