// help from here: http://scottksmith.com/blog/2014/05/29/beer-locker-building-a-restful-api-with-node-passport/
// followed this tutorial for building the basics.
var express = require('express');
var router = express.Router();
var path = require('path');

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return;

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

router.get('/accounts', function (req, res, next) { //the request to render the page
    // var db = req.db;
    // var roomInfo = db.get('roomInfo');
    // roomInfo.find({}, function(e, result) {
    //     res.render('test', {
    //         room: result
    //     });
    // });

    isLoggedIn(req, res, next);

    res.render('accountPage', {    // render the page with server side variables passed to the client
        test: "test"
    });

});

module.exports = router;