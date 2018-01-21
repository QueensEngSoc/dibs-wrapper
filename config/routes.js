//Serving routes
var index = require('../routes/index');
var loginPage = require('../routes/login');
var accountPage = require('../routes/accounts');
var signupPage = require('../routes/signup');
var map = require('../routes/map')
// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', index);

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form

    // app.get('/login', isLoggedInTest, function(req, res) {
    //     app.get('/login', loginPage);
    // });
    app.get('/login', loginPage);

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/accounts', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', signupPage);

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/accounts', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/bookroom', index);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/accounts', isLoggedIn, function(req, res) {
        console.log("User is logged in!");

        res.render('accountPage',{
            user: req.user
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/map', map);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}

function isLoggedInTest(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        res.redirect('/accounts');

    // if they aren't redirect them to the login page
    return next();
}
