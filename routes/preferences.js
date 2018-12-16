var express = require('express');
var prefGetter = require('../models/preferences');
var router = express.Router();

router.get('/preferences', function (req, res) {
    if (!req.isAuthenticated())
        return res.redirect('/accounts');

    getPrefs(req).then(function(theme) {
        res.render('preferences', {
            useTheme: !!theme.useTheme && !theme.customColors.useCustom,
            theme: theme.useTheme,
            customColors: theme.customColors,
            df: theme.useTheme === 'default',
            rg: theme.useTheme === 'rg-cb',
            mnk: theme.useTheme === 'monokai',
            drk: theme.useTheme === 'darkcula',
            mrn: theme.useTheme === 'modern',
            cst: theme.customColors.useCustom,
            ocb: theme.ocb,
            other: theme.other
        });
    }).catch(function(err) {
        console.log(err.stack);
        res.status(500).render('404', {
            message: ":("
        });
    })
});

router.put('/preferences', function (req, res) {
    if (!req.isAuthenticated())
        return res.redirect('/login');

    setPrefs(req, req.body).then(function() {
        res.sendStatus(200);
    }).catch(function() {
        res.sendStatus(500);
    });
});

function setPrefs(req, newPrefs) {
    return new Promise(function(resolve, reject) {
        prefGetter.updatePrefsObj(req, newPrefs).then(function() {
            resolve(true);
        }).catch(function(err) {
            console.log(err);
            reject(false);
        });
    });
}

function getPrefs(req) {
    return new Promise(function(resolve, reject) {
        prefGetter.getPrefsObj(req).then(function(prefObj) {
            resolve(prefObj);
        }).catch(function(err) {
            console.err(err);
            reject();
        });
    });
}

export default router;
