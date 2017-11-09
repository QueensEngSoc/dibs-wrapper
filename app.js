const express = require('express');
const server = express();
const path = require('path');

server.use(express.static('public'));
server.use(express.static('HTML'));

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/HTML/listskeleton.html'));
});

server.listen(8000, function () {
    console.log('Example app listening on port 8000!');
});
