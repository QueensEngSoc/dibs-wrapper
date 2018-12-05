// from https://scotch.io/tutorials/easy-node-authentication-setup-and-local#toc-database-config-configdatabasejs

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
        verified     : Boolean,
        verify_token : String,
        preferences  : String,
        version      : Number,
        booking_count: Number,
        lastBookedRooms: String,
        quicky       : String,
        isAdmin      : Boolean
    }
    // uncomment below section  if we eventually ever want to use other forms of authentication
    // (which I doubt, but ¯\_(ツ)_/¯ )
    // ,
    // facebook         : {
    //     id           : String,
    //     token        : String,
    //     name         : String,
    //     email        : String
    // },
    // twitter          : {
    //     id           : String,
    //     token        : String,
    //     displayName  : String,
    //     username     : String
    // },
    // google           : {
    //     id           : String,
    //     token        : String,
    //     email        : String,
    //     name         : String
    // }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

