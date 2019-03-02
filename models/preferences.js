import * as consts from "../config/config";
import User from "../models/user";
import * as userFuncs from "../src/lib/userFunctions";

export function getPrefsObj(req) {
    return new Promise(function (resolve, reject) {
        if (req.isAuthenticated()) {
            var user = req.user;
            var json = JSON.parse(user.local.preferences);

            resolve(json);
        }
        else{
            resolve({});
        }
    });
}

/**
 * updatePrefsObj returns true if it updated successfully, and false if not
 * @param req, data  -> to get the user.  Data should be a JSON object
 * @returns {true or false}
 */
export function updatePrefsObj(req, data){
    return new Promise(function (resolve, reject) {
        if (req.isAuthenticated()) {
            var user = req.user;
            var jsonStr = JSON.stringify(data);
            user.local.preferences = jsonStr;

            User.findOneAndUpdate({'local.email': user.local.email}, {'local.preferences': user.local.preferences}, function (err, resp) {
                console.log("Updated user preferences!");
                resolve(true);
            });
        }
        else{
            resolve(false);
        }
    });
}
