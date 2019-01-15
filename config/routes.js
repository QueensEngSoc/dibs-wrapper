//Serving routes
import index from "../routes/index";
import indexReact from "../src/routes/index";
import welcome from "../routes/welcome";
import bookCheckout from "../routes/bookCheckout";
import bookRoom from "../routes/bookRoom";
import book from "../routes/book";
import map from "../routes/map";
import quick from "../src/routes/quick";
import prefPage from "../routes/preferences";
import adminPage from "../routes/admin";
import admin_V2 from '../src/routes/admin';
import signupPage from "../routes/signup";
import accountPage from "../routes/accounts";
import loginPage from "../routes/login";

import getTheme from "../middleware/getThemePref";

// app/routes.js
export default function (app, passport) {
  // =====================================
  // MIDDLEWARE                   ========
  // =====================================
  app.use(getTheme);

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', index);
  app.post('/index', index);
  app.get('/react', indexReact);

  // =============================================
  // BOOK AND BOOKROOM PAGE (with login links) ===
  // =============================================
  app.post('/bookroom', bookRoom);
  app.get('/book/:roomID', book);
  app.get('/book/:roomID/:date', book);

  app.post('/bookcheckout', bookCheckout);
  app.post('/testDayShift', accountPage);

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form

  app.get('/login', loginPage);
  app.post('/login', loginPage);

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/accounts', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
    successFlash: true
  }));

  // =====================================
  // Preferences ==============================
  // =====================================
  app.get('/preferences', prefPage);
  app.put('/preferences', prefPage);

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

  app.get('/admin', adminPage);
  app.get('/admin-v2', admin_V2);

  app.post('/schedule', adminPage);
  app.post('/status', adminPage);
  // app.get('/preferences', prefPage);

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/accounts', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.post('/accounts/unbook', accountPage);
  app.post('/accounts/sendverification', accountPage);
  app.get('/accounts/verify', loginPage);
  app.get('/account/verify', accountPage);

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isAccountMenuOpen function)

  app.get('/accounts', accountPage);
  app.get('/welcome', welcome);

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function (req, res) {
    console.log("User has logged out");
    req.logout();
    res.redirect('/');
  });

  app.get('/map', map);
  app.post('/map', map);

  app.use(function (req, res, next) {
    res.statusCode = 404;
    res.render("404", {
      message: "<p>You seem to have wandered off the beaten path!</p>" +
        "<p><a href='/'>Go back to the homepage</a> or <a href='/quicky'>QuickBook a room</a>!</p>",
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
export function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the login page
  res.redirect('/login');
}
