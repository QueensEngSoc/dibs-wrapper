// Stores the functions used for account based access

function getUserID(req){
    var usrid = -1;

    if (req.isAuthenticated()) {
        try {
            var user = req.user;
            usrid = user.id;

        } catch (exception) {

        }
    }
    return usrid;
}



module.exports = {
    getUserID: getUserID
};