"use strict";

var preferences = require('../models/preferences');

function getThemePref(req, res, next) {
    if (!req.isAuthenticated())
        return next();

    preferences.getPrefsObj(req).then(function (theme) {
        req.theme = theme.useTheme;
        if (theme.useTheme === "custom")
            req.colors = theme.customColors;

        next();
    }).catch(function(err) {
        next();
    });
}

module.exports = {
    getThemePref: getThemePref
};