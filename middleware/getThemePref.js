"use strict";

import * as preferences from "../models/preferences";

export default function getThemePref(req, res, next) {
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
