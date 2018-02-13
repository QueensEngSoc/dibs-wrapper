//Serving routes
var index = require('../routes/index');
var loginPage = require('../routes/login');
var accountPage = require('../routes/accounts');
var signupPage = require('../routes/signup');
// var adminPage = require('../routes/admin');
// var prefPage = require('../routes/preferences');
var quick = require('../routes/quick');
var map = require('../routes/map');
var book = require('../routes/book');
var bookRoom = require('../routes/bookRoom');

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', index);

    // =============================================
    // BOOK AND BOOKROOM PAGE (with login links) ===
    // =============================================
    app.post('/bookroom', bookRoom);
    app.get('/book/:roomID', book);

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form

    app.get('/login', loginPage);

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/accounts', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true, // allow flash messages
        successFlash : true
    }));

    // =====================================
    // =====================================
    // QuickBook ==============================
    // =====================================
    app.get('/quicky', quick);
    app.post('/quicky', quick);
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', signupPage);
    // app.get('/admin', adminPage);
    // app.get('/preferences', prefPage);

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/accounts', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/accounts/unbook', accountPage);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/accounts', accountPage);

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        console.log("User has logged out");
        req.logout();
        res.redirect('/');
    });

    app.get('/map', map);

    app.use(function (req, res, next) {
        res.statusCode = 404;
        res.render("404", {
            message: "<p>You seem to have wandered off the beaten path!</p>" +
                "<p><a href='/'>Go back to the homepage</a> or <a href='/quick'>QuickBook a room</a>!</p>",
            image: "trail.jpg"
        });
    });

    app.use(function (err, req, res, next) { // catches URL errors
        console.error(err.stack);
        res.statusCode = 500;
        res.render('404', {
            message: "<p>Sooooo about that... it's not you... it's us</p>" +
                "<p>Seems like something on our end has gone wrong, you can try " +
                "<a href=\"javascript: location.reload();\">reloading this page</a> or " +
                "<a href=\"/\">go back to the homepage</a> to make another selection.</p>",
            img: "bail.png"
        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}
