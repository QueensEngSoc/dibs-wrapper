// from https://scotch.io/tutorials/easy-node-authentication-setup-and-local#toc-database-config-configdatabasejs

// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');
var randomstring = require("randomstring");
var consts = require('./config');
var emailFuncs = require('../models/sendEmail');

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function () {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({'local.email': email}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    email = email.trim();

                    if (!email.endsWith("@queensu.ca"))
                        return done(null, false, req.flash('signupMessage', 'You must use a valid QueensU email.'));

                    // check to see if there's already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.verified = false;
                        newUser.local.booking_count = 0;

                        var prefs = {
                            useTheme: "default",
                            customColors: {}
                        };

                        newUser.local.preferences = JSON.stringify(prefs);
                        newUser.local.version = consts.userVersion;

                        // var lastBooked = {
                        //     room: -1,
                        //     customColors: {}
                        // };
                        newUser.local.lastBookedRooms = "";

                        var verification_token = randomstring.generate({
                            length: 64
                        });

                        newUser.local.verify_token = verification_token;

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            emailFuncs.sendVerificationEmail(newUser.local.email, consts.fromEmail, newUser.local.verify_token, req);
                            return done(null, newUser);
                        });
                    }

                });

            });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) { // callback with email and password from our form

            email = email.trim();

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({'local.email': email}, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                if (!user.local.verified) {
                    var msg = req.flash('verificationCode');

                    if (msg == user.local.verify_token){
                        User.findOneAndUpdate({'local.email': email}, {'local.verified': true}, function (err, resp) {
                            console.log('The user has been verified!');
                        });

                    }
                    else {
                        emailFuncs.sendVerificationMail(user.local.email, consts.fromEmail, user.local.verify_token, req);
                        return done(null, false, req.flash('loginMessage', 'Verification code incorrect!  A email was resent to your inbox, please try again')); // create the loginMessage and save it to session as flashdata
                    }
                    // user has not gotten verified yet, redirect to login page and complain!

                }

                if (user.local.version != consts.userVersion) {

                    var usr = user.local;
                    usr.email = user.local.email;
                    usr.password = user.local.password;
                    // usr.verified = user.local.verified;
                    if (user.local.version < 3)
                        usr.verified = false;
                    else
                        usr.verified = user.local.verified;

                    if (user.local.booking_count != undefined)
                        usr.booking_count = user.local.booking_count;
                    else
                        usr.booking_count = 0;


                    if (user.local.preferences == undefined){
                        var prefs = {
                            useTheme: "default",
                            customColors: {}
                        };
                        usr.preferences = JSON.stringify(prefs);
                    }
                    else
                        usr.preferences = user.local.preferences;

                    if (user.local.lastBookedRooms == undefined)
                        usr.lastBookedRooms = "";
                    else
                        usr.lastBookedRooms = user.local.lastBookedRooms;

                    usr.version = consts.userVersion;
                    usr.verify_token = user.local.verify_token;

                    User.findOneAndUpdate({'local.email': email}, {'local': usr}, function (err, resp) {
                        console.log('The user has been updated to the latest schema! Now on version ' + usr.version + " from " + user.local.version);
                    });

                    return done(null, false, req.flash('loginMessage', 'User updated and is no longer verified!  A email was sent to your inbox, please verify your account!')); // create the loginMessage and save it to session as flashdata

                }
                // all is well, return successful user
                return done(null, user);
            });

        }));

};

// since by default, this is not (yet?) a part of the version of JS used by node (But it is in ES6)
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
